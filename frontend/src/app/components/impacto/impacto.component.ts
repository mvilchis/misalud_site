import { Component, OnInit, OnChanges } from '@angular/core';
import { ImpactoService } from '../../services/impacto.service';
import { HeaderService } from '../../services/header.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as d3 from 'd3';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import * as $ from 'jquery';
import { GCsvService } from '../../services/g-csv.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { fmilesPipe } from '../../pipes/fmiles.pipe';


@Component({
  selector: 'app-impacto',
  templateUrl: './impacto.component.html',
  providers: [fmilesPipe]
})
export class ImpactoComponent implements OnInit {

  deviceInfo = null;

  helps_option;
  help_txt_calidad = 'Total que respondió sí/no a la pregunta "¿Le midieron el crecimiento de su abdomen?" por edad.';
  help_txt_cancel = 'Total de usuarias que se dieron de baja de misalud, por tipo (embarazo, mamá o prestador de servicios de salud).';
  help_txt_alert = 'Alertas canalizadas al 01800-MATERNA, por tipo (embarazo, mamá o prestador de servicios de salud).';
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  meses_inicio = [];
  meses_fin = [];
  i_mes = '1';
  i_year = '2016';
  f_mes = 'none';
  f_year = 'none';
  years_fin = [];
  years_inicio = [];
  i_date = '2016-1-01T00:00:00';
  f_date = 'none';
  invalido = false;


  calidad_op = 'none';
  doble_baropcion = 'none';
  total_cancel = 0;
  total_calidad = 0;
  total_alert = 0;
  sub_cancel_op = 'baby';
  sub_alert_op = 'baby';
  chart_calidad = true;
  chart_cancel = true;
  chart_alert = true;



  margin = { top: 20, right: 20, bottom: 5, left: 40 };
  width2 = 400 - this.margin.left - this.margin.right;
  height2 = 300 - this.margin.top - this.margin.bottom;

  width = 400;
  height = 300;

  width_doble = 0;
  height_doble = 0;
  conversion = '';

  tree_opcion = 'none';
  simple_bar_opcion = 'none';
  doble_bar_opction = 'none';


  RangoColores = [
    '#005a6d',
    '#009784',
    '#00c395',
    '#30dbb1',
    '#6ceecf',
    '#9efbe3',
    '#9be7c3',
    '#97d3a3',
    '#a3cf92',
    '#dde58f'
  ];
  dta_doble;
  dta_tree;
  dta_bar;


  constructor(private _impactoService: ImpactoService,
    private _headerService: HeaderService,
    public _generateService: GCsvService,
    private deviceService: DeviceDetectorService,
    private fmiles_pipe: fmilesPipe) {

    this._headerService.encabezado = 0;
    this._headerService.active_change('impact');
  }

  ngOnInit() {
    this.device();
    this.buildYears();
    this.meses_inicio = this.meses;
    this._impactoService.carga_help().subscribe(resp => {
      this.helps_option = resp;
    });
    //build chart userType
    this._impactoService.get_cancelType(this.sub_cancel_op, this.i_date, this.f_date).subscribe(resp => {

      if (resp[0] > 0) {
        this.chart_cancel = true;
        //d3.selectAll("#chart_simple > svg > g > *").remove();
        this.bar_chart(resp[1], '#chart_simple', 'general_simple', '#tool_simple');
        this.simple_bar_opcion = 'simple_tipo';
        this.legends(resp[1], '#lgn_simple');
        this.total_cancel = resp[0];

        //d3.selectAll("#chart_simple_expand > svg > g > *").remove();
        this.bar_chart(resp[1], '#chart_simple_expand', 'general_simple_expand', '#tool_simple_expand');

        this.legends(resp[1], '#lgn_simple_expand');
      } else {
        this.chart_cancel = false;
        this.total_cancel = resp[0];
        d3.selectAll('#chart_simple > *').remove();
        d3.selectAll('#chart_simple_expand > *').remove();
        d3.selectAll('#lgn_simple > *').remove();
      }


    });

    this._impactoService.get_alertType(this.sub_alert_op, this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_alert = true;
        this.treeMap(resp[2], '#chart_tree', 'tool_tree');
        this.legends(resp[1], '#lgn_tree');
        this.tree_opcion = 'tree_tipo';
        this.total_alert = resp[0];
        this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
        this.legends(resp[1], '#lgn_tree_expand');
      } else {
        this.chart_alert = false;
        this.total_alert = resp[0];
        d3.selectAll('#lgn_tree > *').remove();
        d3.selectAll('#chart_tree >*').remove();
      }


    });

    //build doble bar
    this._impactoService.get_calidadMomAge('calidad_crecimuterino', 'none', 'none').subscribe(resp => {

      if (resp[0] > 0) {
        this.doble_bar(resp[1], '#chart_doble', '#tool_doble');
        this.doble_bar(resp[1], '#chart_doble_expand', '#tool_doble_expand');
        this.calidad_op = 'calidad_crecimuterino';
        this.doble_bar_opction = 'doble_mAge';
        this.total_calidad = resp[0];
        d3.selectAll('#lgn_doble > *').remove();
        this.legends_doble(resp[1], '#lgn_doble');
        d3.selectAll('#lgn_doble_expand > *').remove();
        this.legends_doble(resp[1], '#lgn_doble_expand');

      } else {
        this.chart_calidad = false;
        d3.selectAll('#chart_doble > *').remove();
        d3.selectAll('#chart_doble_expand >  *').remove();
      }
    });

  }

  //bild years 2016 to now year
  buildYears() {
    const now = new Date();
    const nowYear = now.getFullYear();
    const mes = now.getMonth();
    const meses_f = [];

    this.f_date = `${nowYear}-${mes}-28T00:00:00`;
    this.f_mes = mes + 1 + '';
    this.f_year = nowYear + '';
    const years = [];
    for (let y = 2016; y <= nowYear; y++) {
      years.push(y);
    }
    for (let m = 0; m <= mes; m++) {
      meses_f.push(this.meses[m]);
    }
    this.meses_fin = meses_f;
    this.years_fin = years;
    this.years_inicio = years;
  }

  changeDate() {
    if (parseInt(this.i_year) > parseInt(this.f_year)) {
      this.invalido = true;
      return;
    }

    else if (parseInt(this.i_year) == parseInt(this.f_year)) {
      if (parseInt(this.i_mes) > parseInt(this.f_mes)) {
        this.invalido = true;
        return;
      }
      else {
        this.invalido = false;
      }

    }
    else {
      this.invalido = false;
    }
    let inicio = 'none';
    let fin = 'none';
    const resp = [];


    inicio = `${this.i_year}-${this.i_mes}-01T00:00:00`;

    fin = `${this.f_year}-${this.f_mes}-28T00:00:00`;

    this.i_date = inicio;
    this.f_date = fin;

    this.tree_change();
    this.simple_bar_change();
    this.doble_change();

  }
  changeMonth(select) {
    const dt = new Date();
    const year = dt.getFullYear() + '';
    const mes = dt.getMonth() + 1;
    const meses = [];


    if (select == 1) {
      if (this.i_year == year) {
        for (let i = 0; i < mes; i++) {
          meses.push(this.meses[i]);
        }

        this.meses_inicio = meses;
        if (parseInt(this.i_mes) > (meses.length) + 1) {
          this.i_mes = '1';
        }
      } else {
        this.meses_inicio = this.meses;

      }

    } else {
      if (this.f_year == year) {
        for (let i = 0; i < mes; i++) {
          meses.push(this.meses[i]);
        }

        this.meses_fin = meses;
        if (parseInt(this.f_mes) > (meses.length) + 1) {
          this.f_mes = '1';
        }
      } else {
        this.meses_fin = this.meses;

      }

      //chnge year start
    }

    this.changeDate();
  }


  doble_change() {

    switch (this.doble_bar_opction) {
      case 'doble_mAge':
        this._impactoService.get_calidadMomAge(this.calidad_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_calidad = true;

            //    d3.selectAll("#chart_doble > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble', '#tool_doble');

            this.total_calidad = resp[0];
            d3.selectAll('#lgn_doble > *').remove();
            this.legends_doble(resp[1], '#lgn_doble');

            //    d3.selectAll("#chart_doble_expand > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble_expand', '#tool_doble_expand');
            d3.selectAll('#lgn_doble_expand > *').remove();
            this.legends_doble(resp[1], '#lgn_doble_expand');

          } else {
            this.chart_calidad = false;
            this.total_calidad = resp[0];
            d3.selectAll('#chart_doble > *').remove();
            d3.selectAll('#chart_doble_expand >  *').remove();
            d3.selectAll('#lgn_doble > *').remove();
          }


        });

        break;
      case 'doble_bbyAage':
        this._impactoService.get_calidadBbyAge(this.calidad_op, this.i_date, this.f_date).subscribe(resp => {

          if (resp[0] > 0) {
            this.chart_calidad = true;
            //  d3.selectAll("#chart_doble > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble', '#tool_doble');
            this.total_calidad = resp[0];
            d3.selectAll('#lgn_doble > *').remove();
            this.legends_doble(resp[1], '#lgn_doble');

            //    d3.selectAll("#chart_doble_expand > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble_expand', '#tool_doble_expand');
            d3.selectAll('#lgn_doble_expand > *').remove();
            this.legends_doble(resp[1], '#lgn_doble_expand');



          } else {
            this.chart_calidad = false;
            d3.selectAll('#chart_doble > *').remove();
            d3.selectAll('#lgn_doble > *').remove();
            d3.selectAll('#chart_doble_expand >  *').remove();
          }

        });

        break;
      case 'doble_sGestacion':
        this._impactoService.get_calidadSgestacion(this.calidad_op, this.i_date, this.f_date).subscribe(resp => {

          if (resp[0] > 0) {
            this.chart_calidad = true;
            //  d3.selectAll("#chart_doble > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble', '#tool_doble');
            this.total_calidad = resp[0];
            d3.selectAll('#lgn_doble > *').remove();
            this.legends_doble(resp[1], '#lgn_doble');

            //  d3.selectAll("#chart_doble_expand > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble_expand', '#tool_doble_expand');
            d3.selectAll('#lgn_doble_expand > *').remove();
            this.legends_doble(resp[1], '#lgn_doble_expand');

          } else {
            this.chart_calidad = false;
            d3.selectAll('#chart_doble > *').remove();
            d3.selectAll('#lgn_doble > *').remove();
            d3.selectAll('#chart_doble_expand >  *').remove();
          }


        });


        break;
      case 'doble_aMedica':

        this._impactoService.get_calidadAten(this.calidad_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_calidad = true;


            //d3.selectAll("#chart_doble > svg >g >  *").remove();
            this.doble_bar(resp[1], '#chart_doble', '#tool_doble');
            this.total_calidad = resp[0];
            d3.selectAll('#lgn_doble > *').remove();
            this.legends_doble(resp[1], '#lgn_doble');

            //d3.selectAll("#chart_doble_expand > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble_expand', '#tool_doble_expand');
            d3.selectAll('#lgn_doble_expand > *').remove();
            this.legends_doble(resp[1], '#lgn_doble_expand');

          } else {
            this.chart_calidad = false;
            d3.selectAll('#chart_doble > *').remove();
            d3.selectAll('#lgn_doble > *').remove();
            d3.selectAll('#chart_doble_expand >  *').remove();
          }

        });
        break;
      case 'doble_medio':

        this._impactoService.get_calidadMedio(this.calidad_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_calidad = true;

            //d3.selectAll("#chart_doble > svg > g > *").remove();
            this.doble_bar(resp[1], '#chart_doble', '#tool_doble');
            this.total_calidad = resp[0];
            d3.selectAll('#lgn_doble > *').remove();
            this.legends_doble(resp[1], '#lgn_doble');
            //  d3.selectAll("#chart_doble_expand > svg >g >   *").remove();
            this.doble_bar(resp[1], '#chart_doble_expand', '#tool_doble_expand');
            d3.selectAll('#lgn_doble_expand > *').remove();
            this.legends_doble(resp[1], '#lgn_doble_expand');

          } else {
            this.chart_calidad = false;
            d3.selectAll('#chart_doble > *').remove();
            d3.selectAll('#lgn_doble > *').remove();
            d3.selectAll('#chart_doble_expand >  *').remove();
          }


        });
        break;

    }

  }

  tree_change(opcion?) {

    switch (this.tree_opcion) {
      case 'tree_tipo':
        if (opcion == 'none') {
          this.sub_alert_op = 'baby';
        }
        this._impactoService.get_alertType(this.sub_alert_op, this.i_date, this.f_date).subscribe(resp => {

          if (resp[0] > 0) {
            this.chart_alert = true;

            //d3.selectAll("#chart_tree >*").remove();
            d3.selectAll('#lgn_tree > *').remove();
            this.treeMap(resp[2], '#chart_tree', 'tool_tree');
            this.legends(resp[1], '#lgn_tree');
            this.tree_opcion = 'tree_tipo';
            this.total_alert = resp[0];


            d3.selectAll('#lgn_tree_expand > *').remove();
            this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
            this.legends(resp[1], '#lgn_tree_expand');

          } else {
            this.chart_alert = false;
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree > *').remove();
            d3.selectAll('#chart_tree >*').remove();
          }

        });

        break;
      case 'tree_mom':
        if (opcion == 'none') {
          this.sub_alert_op = '0';
        }
        this._impactoService.get_alertMomAge(this.sub_alert_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_alert = true;

            d3.selectAll('#lgn_tree > *').remove();
            this.treeMap(resp[2], '#chart_tree', 'tool_tree');
            this.legends(resp[1], '#lgn_tree');
            this.tree_opcion = 'tree_mom';
            this.total_alert = resp[0];


            d3.selectAll('#lgn_tree_expand > *').remove();
            this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
            this.legends(resp[1], '#lgn_tree_expand');

          } else {
            this.chart_alert = false;
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree > *').remove();
            d3.selectAll('#chart_tree >*').remove();
          }

        });

        break;
      case 'tree_bby':
        if (opcion == 'none') {
          this.sub_alert_op = '0';
        }
        this._impactoService.get_alertBbyAge(this.sub_alert_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_alert = true;

            d3.selectAll('#lgn_tree > *').remove();
            this.treeMap(resp[2], '#chart_tree', 'tool_tree');
            this.legends(resp[1], '#lgn_tree');
            this.tree_opcion = 'tree_bby';
            this.total_alert = resp[0];


            d3.selectAll('#lgn_tree_expand > *').remove();
            this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
            this.legends(resp[1], '#lgn_tree_expand');

          } else {
            this.chart_alert = false;
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree > *').remove();
            d3.selectAll('#chart_tree >*').remove();
          }

        });


        break;
      case 'tree_aten':
        if (opcion == 'none') {
          this.sub_alert_op = '0';
        }
        this._impactoService.get_alertHospital(this.sub_alert_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_alert = true;

            d3.selectAll('#lgn_tree > *').remove();
            this.treeMap(resp[2], '#chart_tree', 'tool_tree');
            this.legends(resp[1], '#lgn_tree');
            this.tree_opcion = 'tree_aten';
            this.total_alert = resp[0];


            d3.selectAll('#lgn_tree_expand > *').remove();
            this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
            this.legends(resp[1], '#lgn_tree_expand');

          } else {
            this.chart_alert = false;
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree > *').remove();
            d3.selectAll('#chart_tree >*').remove();
          }

        });



        break;
      case 'tree_medio':
        if (opcion == 'none') {
          this.sub_alert_op = 'facebook';
        }
        this._impactoService.get_alertMedio(this.sub_alert_op, this.i_date, this.f_date).subscribe(resp => {


          if (resp[0] > 0) {
            this.chart_alert = true;

            d3.selectAll('#lgn_tree > *').remove();
            this.treeMap(resp[2], '#chart_tree', 'tool_tree');
            this.legends(resp[1], '#lgn_tree');
            this.tree_opcion = 'tree_medio';
            this.total_alert = resp[0];


            d3.selectAll('#lgn_tree_expand > *').remove();
            this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
            this.legends(resp[1], '#lgn_tree_expand');

          }
          else {
            this.chart_alert = false;
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree > *').remove();
            d3.selectAll('#chart_tree >*').remove();
          }

        });

        break;

      case 'tree_razon':

        this._impactoService.get_alertReason(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            d3.selectAll('#lgn_tree > *').remove();
            this.treeMap(resp[2], '#chart_tree', 'tool_tree');
            this.legends(resp[1], '#lgn_tree');
            this.tree_opcion = 'tree_razon';
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree_expand > *').remove();
            this.treeMap(resp[2], '#chart_tree_expand', 'tool_tree_expand');
            this.legends(resp[1], '#lgn_tree_expand');

          } else {
            this.chart_alert = false;
            this.total_alert = resp[0];
            d3.selectAll('#lgn_tree > *').remove();
            d3.selectAll('#chart_tree >*').remove();
          }
        });


        break;


    }

  }


  simple_bar_change(opcion?) {
    switch (this.simple_bar_opcion) {
      case 'simple_tipo':
        if (opcion == 'none') {
          this.sub_cancel_op = 'baby';
        }
        this._impactoService.get_cancelType(this.sub_cancel_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_cancel = true;
            d3.selectAll('#lgn_simple > *').remove();
            this.bar_chart(resp[1], '#chart_simple ', 'general_simple', '#tool_simple');
            this.simple_bar_opcion = 'simple_tipo';
            this.legends(resp[1], '#lgn_simple');
            this.total_cancel = resp[0];


            //d3.selectAll("#chart_simple_expand > svg > g > *").remove();
            d3.selectAll('#lgn_simple_expand > *').remove();
            this.bar_chart(resp[1], '#chart_simple_expand ', 'general_simple_expand', '#tool_simple_expand');
            this.legends(resp[1], '#lgn_simple_expand');

          } else {
            this.chart_cancel = false;
            this.total_cancel = resp[0];
            d3.selectAll('#chart_simple > *').remove();
            d3.selectAll('#chart_simple_expand > *').remove();
            d3.selectAll('#lgn_simple > *').remove();
          }

        });

        break;
      case 'simple_mom':
        if (opcion == 'none') {
          this.sub_cancel_op = '0';
        }
        this._impactoService.get_cancelMomAge(this.sub_cancel_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_cancel = true;
            d3.selectAll('#lgn_simple > *').remove();
            this.bar_chart(resp[1], '#chart_simple ', 'general_simple', '#tool_simple');
            this.simple_bar_opcion = 'simple_mom';
            this.legends(resp[1], '#lgn_simple');
            this.total_cancel = resp[0];


            d3.selectAll('#lgn_simple_expand > *').remove();
            this.bar_chart(resp[1], '#chart_simple_expand ', 'general_simple_expand', '#tool_simple_expand');
            this.legends(resp[1], '#lgn_simple_expand');

          } else {
            this.chart_cancel = false;
            this.total_cancel = resp[0];
            d3.selectAll('#chart_simple > *').remove();
            d3.selectAll('#chart_simple_expand > *').remove();
            d3.selectAll('#lgn_simple > *').remove();
          }

        });

        break;
      case 'simple_bby':
        if (opcion == 'none') {
          this.sub_cancel_op = '0';
        }
        this._impactoService.get_cancelBbyAge(this.sub_cancel_op, this.i_date, this.f_date).subscribe(resp => {

          if (resp[0] > 0) {
            this.chart_cancel = true;
            d3.selectAll('#lgn_simple > *').remove();
            this.bar_chart(resp[1], '#chart_simple ', 'general_simple', '#tool_simple');
            this.simple_bar_opcion = 'simple_bby';
            this.legends(resp[1], '#lgn_simple');
            this.total_cancel = resp[0];


            d3.selectAll('#lgn_simple_expand > *').remove();
            this.bar_chart(resp[1], '#chart_simple_expand ', 'general_simple_expand', '#tool_simple_expand');
            this.legends(resp[1], '#lgn_simple_expand');

          } else {
            this.chart_cancel = false;
            this.total_cancel = resp[0];
            d3.selectAll('#chart_simple > *').remove();
            d3.selectAll('#chart_simple_expand > *').remove();
            d3.selectAll('#lgn_simple > *').remove();
          }

        });


        break;
      case 'simple_aten':
        if (opcion == 'none') {
          this.sub_cancel_op = '0';
        }
        this._impactoService.get_cancelHospital(this.sub_cancel_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_cancel = true;

            d3.selectAll('#lgn_simple > *').remove();
            this.bar_chart(resp[1], '#chart_simple ', 'general_simple', '#tool_simple');
            this.simple_bar_opcion = 'simple_aten';
            this.legends(resp[1], '#lgn_simple');
            this.total_cancel = resp[0];


            d3.selectAll('#lgn_simple_expand > *').remove();
            this.bar_chart(resp[1], '#chart_simple_expand ', 'general_simple_expand', '#tool_simple_expand');
            this.legends(resp[1], '#lgn_simple_expand');

          } else {
            this.chart_cancel = false;
            this.total_cancel = resp[0];
            d3.selectAll('#chart_simple > *').remove();
            d3.selectAll('#chart_simple_expand > *').remove();
            d3.selectAll('#lgn_simple > *').remove();
          }

        });

        break;
      case 'simple_medio':
        if (opcion == 'none') {
          this.sub_cancel_op = 'facebook';
        }
        this._impactoService.get_cancelMedio(this.sub_cancel_op, this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_cancel = true;

            d3.selectAll('#lgn_simple > *').remove();
            this.bar_chart(resp[1], '#chart_simple ', 'general_simple', '#tool_simple');
            this.simple_bar_opcion = 'simple_medio';
            this.legends(resp[1], '#lgn_simple');
            this.total_cancel = resp[0];


            d3.selectAll('#lgn_simple_expand > *').remove();
            this.bar_chart(resp[1], '#chart_simple_expand ', 'general_simple_expand', '#tool_simple_expand');
            this.legends(resp[1], '#lgn_simple_expand');

          } else {
            this.chart_cancel = false;
            this.total_cancel = resp[0];
            d3.selectAll('#chart_simple > *').remove();
            d3.selectAll('#chart_simple_expand > *').remove();
            d3.selectAll('#lgn_simple > *').remove();

          }

        });

        break;

      case 'simple_razon':
        this._impactoService.get_cancelReason(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_cancel = true;
            //d3.selectAll("#chart_simple > svg > g > *").remove();
            d3.selectAll('#lgn_simple > *').remove();
            this.bar_chart(resp[1], '#chart_simple ', 'general_simple', '#tool_simple');
            this.simple_bar_opcion = 'simple_razon';
            this.legends(resp[1], '#lgn_simple');
            this.total_cancel = resp[0];

            //d3.selectAll("#chart_simple_expand > svg > g > *").remove();
            d3.selectAll('#lgn_simple_expand > *').remove();
            this.bar_chart(resp[1], '#chart_simple_expand ', 'general_simple_expand', '#tool_simple_expand');
            this.legends(resp[1], '#lgn_simple_expand');

          } else {
            this.chart_cancel = false;
            this.total_cancel = resp[0];
            d3.selectAll('#chart_simple > *').remove();
            d3.selectAll('#chart_simple_expand > *').remove();
            d3.selectAll('#lgn_simple > *').remove();

          }

        });
        break;
    }
  }

  ///-------------------doble bar_chart----------------------------------------

  doble_bar(data, grafica, tooltip) {
    //console.log(data);
    this.help_build(0);
    var explorador = this.deviceInfo.browser;
    let csv_dta = [];
    for (let dato of data) {
      let si = {
        seccion: "impacto",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        categoria: "Calidad Clínica ",
        variable: "",
        subvariable: '',
        campo: '',
        total: ''
      }
      let no = {
        seccion: "impacto",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        categoria: "Calidad Clínica ",
        variable: "",
        subvariable: '',
        campo: '',
        total: ''
      }

      si.campo = "(" + dato.name + ") Si: ";
      si.total = Math.round(dato.si) + "%";
      csv_dta.push(si);
      no.campo = "(" + dato.name + ") No: ";
      no.total = Math.round(dato.no) + "%";
      csv_dta.push(no);

    }
    this.dta_doble = csv_dta;

    d3.select(grafica + '> *').remove();
    const svg = d3.select(grafica)
      .append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid')
      .append("g")
      .attr('id', 'general_doble')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    const colores = this.RangoColores;
    const tool = d3.select(tooltip);
    const valores = [];
    for (const dto of data) {
      valores.push(dto.si + dto.no);
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    // Stack Layout
    const stack = d3.stack().keys([
      'si', 'no'
    ]);
    const stack_data = stack(data);

    // Scales
    const x_scale = d3.scaleBand()
      .domain(data.map(function(d) { return d.name; }))
      .range([0, this.width2])
      .paddingInner(0.5)
      .paddingOuter(0.5);

    const y_scale2 = d3.scaleLinear()
      .range([this.height2, 0])
      .domain([0, 100]);

    const y_scale = d3.scaleLinear()
      .domain([0,
        d3.max(valores)
      ])
      .range([this.height2, 0]);


    const xAxis = d3.axisBottom(x_scale);
    const yAxis = d3.axisLeft(y_scale2);

    //Pattern injection
    const defs = svg.append('defs')
      .append('pattern')
      .attr('id', 'hash4_4')
      .attr('width', '8')
      .attr('height', '8')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)')
      .append('rect')
      .attr('width', '4')
      .attr('height', '8')
      .attr('transform', 'translate(0,0)')
      .attr('fill', '#00556b');


    // Groups
    const groups = svg.selectAll('g')
      .data(stack_data)
      .enter()
      .append('g')
      .style('fill', function(d, i) {
        if (i == 1 && explorador != 'safari') {
          return 'url(#hash4_4)';
        }
        if (i == 1 && explorador == 'safari') {
          return '#ccc';
        }
      });

    // Rectangles
    groups.selectAll('rect')
      .data(function(d) {
        return d;
      })
      .enter()
      .append('rect')
      .on('mousemove', showTooltip)
      .on('mouseout', hideTooltip)
      .attr('x', function(d: any) {
        return x_scale(d.data.name);
      })
      .attr('y', function(d) {
        return y_scale(d[1]);
      })
      .transition()
      .duration(1000)
      .attr('height', function(d) {
        return y_scale(d[0]) - y_scale(d[1]);
      })
      .attr('width', x_scale.bandwidth())
      .attr('fill', function(d, i) {
        if (d[0] == 0) {
          return colores[i];
        }
      });

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height2 + ')')
      .append('rect')
      .attr('width', this.width * .8)
      .attr('height', '.3px');

    function showTooltip(d) {

      let texto = '';
      if (d[0] == 0) {
        texto = 'Si: ' + Math.round(d.data.si) + '%';
      }
      if (d[0] > 0) {
        texto = 'No: ' + Math.round(d.data.no) + '%';
      }
      const left = d3.mouse(this)[0] - 30 + 'px';
      const top = d3.mouse(this)[1] - 30 + 'px';

      tool.style('left', '44%')
        .style('top', '75%')
        .style('display', 'inline-block')
        .html(texto);
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }

  }

  //simple chart bar

  bar_chart(data, grafico, gtext, tool_tip) {
    this.help_build(1);
    this.dta_bar = data;

    let csv_dta = [];
    for (let dato of data) {
      let objeto = {
        seccion: "impacto",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        categoria: "Cancelación de misalud",
        variable: "",
        subvariable: '',
        campo: '',
        total: ""

      }
      objeto.campo = dato.name;
      objeto.total = Math.round(dato.size) + "%";
      csv_dta.push(objeto);

    }
    this.dta_bar = csv_dta;

    d3.select(grafico + '> *').remove();
    const grafica = d3.select(grafico).append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid')

      .append('g')
      .attr('id', gtext)
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    const tool = d3.select(tool_tip);
    const colores = this.RangoColores;

    const names = [];
    const values = [];
    for (const dato of data) {
      names.push(dato.name);
      values.push(dato.size);
    }

    const altura = this.height2;
    const x_scale = d3.scaleBand()
      .range([0, this.width2]);

    const y_scale = d3.scaleLinear()
      .range([this.height2, 0]);

    const xAxis = d3.axisBottom(x_scale);

    const yAxis = d3.axisLeft(y_scale);

    x_scale.domain(data.map(function(d) { return d.name; }))
      .paddingInner(0.4)
      .paddingOuter(0.6);
    y_scale.domain([0, d3.max(values)]);



    grafica.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height2 + ')')
      .append('rect')
      .attr('width', this.width * .8)
      .attr('height', '.3px');

    grafica.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end');




    grafica.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .on('mousemove', showTooltip)
      .on('mouseout', hideTooltip)
      .attr('class', 'bar')

      .attr('x', x_escla)
      .attr('width', x_scale.bandwidth())

      .attr('y', function(d: any) {

        return y_scale(d.size);
      })
      .transition()
      .duration(1000)
      .attr('height', function(d: any) {
        return altura - y_scale(d.size);
      })
      .attr('fill', function(d, i) {
        return colores[i];
      });


    const textos = d3.select('#' + gtext).append('g');
    // Create Labels

    textos.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(texto)
      .attr('x', x_esclat)
      .attr('y', function(d: any) {

        return y_scale(d.size) - 5;
      })
      .attr('font-size', 14)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none');

    function showTooltip(d) {


      const left = d3.mouse(this)[0] - 30 + 'px';
      const top = d3.mouse(this)[1] - 30 + 'px';

      tool.style('left', '35%')
        .style('top', '78%')
        .style('display', 'inline-block')
        .html(d.name);
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }

    function texto(d) {

      return Math.round(d.size) + '%';

    }

    function x_escla(d) {


      return x_scale(d.name);
    }

    function x_esclat(d) {


      return x_scale(d.name) + x_scale.bandwidth() / 2;
    }


  }



  //treemap

  treeMap(data, grafico, tooltip) {
    this.help_build(3);
    let csv_dta = [];
    for (let dato of data.children) {
      let objeto = {
        seccion: "impacto",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        categoria: "Alertas Canalizadas",
        variable: "",
        subvariable: '',
        campo: '',
        total: ''

      }
      objeto.campo = dato.name;
      objeto.total = Math.round(dato.size) + "%";
      csv_dta.push(objeto);


    }
    this.dta_tree = csv_dta;
    d3.selectAll(grafico + '> *').remove();
    const grafica = d3.select(grafico)
      .append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid');

    d3.select(grafico).append('div')
      .attr('id', tooltip)
      .attr('class', 'tooltipMapa');

    const colores = this.RangoColores;
    const tool = d3.select('#' + tooltip);

    const valores = [];
    for (const valor of data.children) {
      valores.push(valor.size);
    }


    const treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([this.width, this.height])
      .round(true)
      .paddingInner(1);
    const root = d3.hierarchy(data)
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name; })
      .sum(sumBySize)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

    treemap(root);


    const cell = grafica.selectAll('g')
      .data(root.leaves())

      .enter().append('g')
      .attr('transform', function(d: any) { return 'translate(' + d.x0 + ',' + d.y0 + ')'; });

    cell.append('rect')
      .on('mousemove', showTooltip)
      .on('mouseout', hideTooltip)

      .attr('id', function(d) { return d.data.id; })
      .attr('width', function(d: any) { return d.x1 - d.x0; })

      .attr('height', function(d: any) { return d.y1 - d.y0; })
      .attr('stroke', 'white')
      .attr('stroke-width', 0.7)
      .attr('fill', function(d: any, i) {
        console.log('index tre: ' + d.data.name + " -" + colores[i]);
        return colores[i];
      });


    cell.append('text')

      .selectAll('tspan')
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append('tspan')
      .attr('x', 4)
      .attr('y', function(d, i) { return 20 + i; })
      .text(function(d: any) { return d; })
      .attr('fill', '#fff')
      .attr('font-family', 'Open Sans')
      .attr('font-size', '15px')
      .attr('text-anchor', 'left')
      .style('pointer-events', 'none');

    function sumByCount(d) {

      return d.response ? 0 : 1;
    }

    function sumBySize(d) {
      return d.size;
    }

    function showTooltip(d) {
      const left = d3.mouse(this)[0] - 30 + 'px';
      const top = d3.mouse(this)[1] - 30 + 'px';

      tool.style('left', '35%')
        .style('top', '78%')
        .style('display', 'inline-block')
        .html(d.data.name + ':\n' + Math.round(d.data.size) + '%');
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }



  }

  legends(data, lgnd: string) {
    const colores = this.RangoColores;

    const legend = d3.select(lgnd).selectAll('legend')
      .data(data);

    legend.enter().append('div')
      .attr('class', 'legends5')
      .append('p')
      .attr('class', 'country-name')
      .append('span')
      .attr('class', 'key-dot')
      .style('background', function(d: any, i) {
        console.log(d.name + " :" + colores[i])
        return colores[i];
      });

    const p = d3.selectAll(lgnd + '  > div>p')
      .insert('text').text(function(d: any, i) {
        return d.name + ': ' + Math.round(d.size) + '%';
      })
      ;

  }

  legends_doble(data, lgnd: string) {
    const colores = this.RangoColores;

    const valores = [];

    for (const dta of data) {

      valores.push(this.fmiles_pipe.transform(dta.total));
    }

    const legend = d3.select(lgnd).selectAll('legend')
      .data(data);

    legend.enter().append('div')
      .attr('class', 'legends5')
      .append('p')
      .attr('class', 'country-name')
      .append('span')
      .attr('class', 'key-dot')
      .style('background', function(d, i) {
        return colores[i];
      });
    const p = d3.selectAll(lgnd + '  > div>p')
      .insert('text').text(function(d: any, i) {
        return d.name + ': ' + valores[i];
      })
      ;



  }

  help_enter(opcion) {
    const opciones = ['#help_calidad', '#help_cancel', '#help_alert'];

    const help = d3.select(opciones[opcion]);
    help.style('display', 'inline');

  }
  help_build(opcion) {
    const opciones = ['#help_calidad', '#help_cancel', '#help_alert'];
    switch (opciones[opcion]) {
      case '#help_calidad':
        for (const op of this.helps_option) {
          if (op.opcion == this.calidad_op + this.doble_bar_opction) {
            this.help_txt_calidad = op.texto;
          }

        }

        break;
      case '#help_cancel':
        for (const op of this.helps_option) {
          if (op.opcion == this.simple_bar_opcion) {
            this.help_txt_cancel = op.texto;
          }

        }

        break;
      case '#help_alert':
        for (const op of this.helps_option) {
          if (op.opcion == this.tree_opcion) {
            this.help_txt_alert = op.texto;
          }

        }

        break;

    }

  }


  help_out(opcion) {
    const opciones = ['#help_calidad', '#help_cancel', '#help_alert'];
    const help = d3.select(opciones[opcion]);
    help.style('display', 'none');
  }

  descarga_chart(grafica, leyenda, nameFile) {
    let title = '';
    let legend = '';
    let help = '';
    const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });
    let lgn = d3.select(leyenda).html();

    if (grafica == "#chart_doble") {
      title = "Calidad Clínica ";
      help = this.help_txt_calidad;

    }
    if (grafica == "#chart_simple") {
      title = "Cancelación de misalud ";
      help = this.help_txt_cancel;

    }
    if (grafica == "#chart_tree") {
      title = "Alertas Canalizadas";
      help = this.help_txt_alert;


    }
    const h_img = this._headerService.headerimg;
    const f_img = this._headerService.footerimg;


    d3.select('#c_bloqueo').style('display', 'block');
    const cambio = d3.select(grafica + '> svg');
    cambio.attr('viewBox', null);
    cambio.attr('preserveAspectRatio', null);
    cambio.attr('width', '400');
    cambio.attr('height', '300');

    const svgString = new XMLSerializer().serializeToString(document.querySelector(grafica + '> svg'));

    d3.select('#i_img').append('canvas').attr('id', 'canvas').attr('width', 400).attr('height', 300);
    const canvas: any = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const DOMURL = self.URL;
    const img = new Image();
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = DOMURL.createObjectURL(svg);
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      //document.querySelector('#chart').innerHTML = '<img src="'+png+'"/>';
      DOMURL.revokeObjectURL(png);
    };
    img.src = url;
    d3.select("#i_title").append('p').attr('class', 'title_impresion').text(title);
    d3.select("#i_help").append('p').attr('class', 'help_impresion').text(help);
    d3.select("#i_legend").append('div').html(lgn);


    const impresion = setTimeout(() => {
      imprimir();
    }, 2000);


    function imprimir() {
      html2canvas(document.getElementById('c_impresion'), { scale: 1 }).then(function(canvas) {

        const img2 = canvas.toDataURL('image/png');

        doc.addImage(h_img, 'JPEG', 5.5, 0);

        doc.addImage(img2, 'JPEG', 55, 100);
        doc.addImage(f_img, 'PNG', 5.5, 255);
        doc.autoPrint();
        doc.save(nameFile + '.pdf');
        d3.selectAll('#i_help >* ').remove();
        d3.selectAll('#i_title >* ').remove();
        d3.selectAll('#i_img >* ').remove();
        d3.selectAll('#i_legend >* ').remove();
        d3.select(grafica + '> svg')
          .attr('width', null)
          .attr('height', null)
          .attr('viewBox', '0 0 400 300')
          .attr('preserveAspectRatio', 'xMidYMid');

        d3.select('#c_bloqueo').style('display', 'none');



      });
    }



  }
  generate_csv() {
    for (let dta of this.dta_tree) {
      dta.variable = $("#tree_var option:selected").text();
      dta.subvariable = $("#tree_sub option:selected").text();
    }

    for (let dta of this.dta_doble) {
      dta.variable = $("#doble_var option:selected").text();
      dta.subvariable = $("#doble_sub option:selected").text();
    }
    for (let dta of this.dta_bar) {
      dta.variable = $("#simple_var option:selected").text();
      dta.subvariable = $("#simple_sub option:selected").text();
    }

    let data = [this.dta_tree, this.dta_doble, this.dta_bar];

    this._generateService.generate(data, 'impacto');





  }

  device() {
    //console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //console.log(this.deviceInfo);

  }



}
