import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { HeaderService } from '../../services/header.service';
import * as d3 from 'd3';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import * as $ from 'jquery';
import { GCsvService } from '../../services/g-csv.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { fmilesPipe } from '../../pipes/fmiles.pipe';
import { DecimalPipe } from '@angular/common';




@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  providers: [DecimalPipe, fmilesPipe]
})
export class UsuariosComponent implements OnInit {
  deviceInfo = null;
  // Dates variables
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
  // End dates
  invalido = false;// no rows
  op_user = 'mAge';// select usr chart
  op_baby = 'bAge';// select bby chart
  bby_atencion = [];
  ejeplovalor = '5%';
  totalUsr = 0;
  totalBby = 0;
  total_usr_channel = 0;
  total_usr_type = 0;
  total_bby_type = 0;

  width = 400;
  height = 300;
  chartRadius = this.height / 2;
  public color;
  chart_usr = true;
  chart_usr_channel = true;
  chart_usr_type = true;

  chart_bby = true;
  chart_bby_channel = true;
  chart_bby_type = true;

  chart_sg = true;

  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  width2 = 400 - this.margin.left - this.margin.right;
  height2 = 300 - this.margin.top - this.margin.bottom;
  help_usr = 'Total de usuarias por edad.';
  help_bby = 'Total de bebés por edad en meses.';

  public svg_line;
  public chart_width = 300;
  public chart_height = 200;

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

  // data csv
  c_usr_dta = [];
  c_bby_dta = [];
  ct_usr_dta = [];
  cr_usr_dta = [];
  ct_bby_dta = [];
  c_line_dta = [];
  c_progress_dta = [];
  // end data csv



  constructor(public _usrService: UsuariosService,
    public _headerService: HeaderService,
    public _generateService: GCsvService,
    private deviceService: DeviceDetectorService,
    private decimalPipe: DecimalPipe,
    private fmiles_pipe: fmilesPipe) {

    this._headerService.encabezado = 0;
    this._headerService.active_change('user');
    //buld radial chart
    this._usrService.get_userByType(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {

        this.chart_usr_type = true;
        this.total_usr_type = resp[0];
        this.userType(resp[1], '#chart', 'tool_radial');
        this.legends(resp[1], '#lgnUsrtype');

        this.userType(resp[1], '#chart_expand', 'tool_radial_expand');
        this.legends(resp[1], '#lgnUsrtype_expand');
      } else {
        this.chart_usr_type = false;
        this.total_usr_type = resp[0];
        d3.selectAll('#chart >*').remove();
        d3.selectAll('#lgnUsrtype >*').remove();


      }
    });

    //build chart userType
    this._usrService.get_momAge(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_usr = true;

        d3.selectAll('#chartusr > *').remove();
        this.bar_chart(resp[1], '#chartusr', 'generalusr', true, 'tool_usr');
        this.totalUsr = resp[0];
        this.legends_bar(resp[1], '#lgn_bar_usr');
        this.bar_chart(resp[1], '#chartusr_expand', 'generalusr_expand', true, 'tool_usr_expand');
        this.legends_bar(resp[1], '#lgn_bar_usr_expand');
      } else {
        this.chart_usr = false;
        this.totalUsr = resp[0];
        d3.selectAll('#chartusr > *').remove();
        d3.selectAll('#lgn_bar_usr > *').remove();
      }

    });

    //build bby chart
    this._usrService.get_bbyAge(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_bby = true;
        d3.selectAll('#chartbby > *').remove();
        this.bar_chart(resp[1], '#chartbby', 'generalbby', false, 'tool_bby');
        this.totalBby = resp[0];
        this.legends_bar(resp[1], '#lgn_bar_bby');
        d3.selectAll('#chartbby_expand > *').remove();
        this.bar_chart(resp[1], '#chartbby_expand', 'generalbby_expand', false, 'tool_bby_expand');
        this.legends_bar(resp[1], '#lgn_bar_bby_expand');
      } else {
        this.chart_bby = false;
        this.totalBby = resp[0];
        d3.selectAll('#chartbby > *').remove();
        d3.selectAll('#lgn_bar_bby > *').remove();
      }

    });

    //progress bar_chart
    this._usrService.get_bbyAtencion(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_bby_type = true;
        this.bby_atencion = resp;
        this.progress_dta_build(resp[1]);

      } else {
        this.chart_bby_type = false;
      }

    });

    //build line chartType
    this._usrService.get_semanaGestacion(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_sg = true;
        this.chart_line(resp[1], '#chart_line');
        this.chart_line(resp[1], '#chart_line_expand');
      } else {
        this.chart_sg = false;
        d3.selectAll('#chart_line >*').remove();
      }



    });

    //buil treemap _usrByChannel
    this._usrService.get_usrByChannel(this.i_date, this.f_date).subscribe(resp => {
      if (resp[2] > 0) {
        this.chart_usr_channel = true;
        this.treeMap(resp[1], '#chartChannel', 'toolChannel', resp[2]);
        this.legends(resp[0], '#lgnChannel');
        this.total_usr_channel = resp[2];
        this.treeMap(resp[1], '#chartChannel_expand', 'toolChannel_expand', resp[2]);
        this.legends(resp[0], '#lgnChannel_expand');
      } else {
        this.chart_usr_channel = false;
        this.total_usr_channel = resp[2];
        d3.selectAll('#chartChannel >*').remove();
        d3.selectAll('#lgnChannel >*').remove();
      }
    });

    //buil treemap _bbyByChannel
    this._usrService.get_bbyByChannel(this.i_date, this.f_date).subscribe(resp => {
      //  console.log(resp[1]);
      if (resp[2] > 0) {
        this.chart_bby_channel = true;
        this.treeMap(resp[1], '#chartChannelbby', 'tooltipChannelBby', resp[2]);
        this.legends(resp[0], '#lgnChannelbby');

        this.total_bby_type = resp[2];

        this.treeMap(resp[1], '#chartChannelbby_expand', 'tooltipChannelBby_expand', resp[2]);
        this.legends(resp[0], '#lgnChannelbby_expand');
      } else {
        this.chart_bby_channel = false;
        this.total_bby_type = resp[2];
        d3.selectAll('#chartChannelbby >*').remove();
        d3.selectAll('#lgnChannelbby >*').remove();
      }
    });

  }

  ngOnInit() {
    //----------------set dates --------------------
    this.device();
    this.buildYears();
    this.meses_inicio = this.meses;
  }


  //bild years 2016 to now year
  buildYears() {
    const now = new Date();
    const nowYear = now.getFullYear();
    const mes = now.getMonth();
    const meses_f = [];
    this.f_date = `${nowYear}-${mes + 1}-28T00:00:00`;
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
    this.varChangeBaby();
    this.varChangeUser();
    this.changeStaticChart();
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

  //rebuild with date
  changeStaticChart() {
    //buld radial chart
    this._usrService.get_userByType(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {

        this.chart_usr_type = true;

        d3.selectAll('#lgnUsrtype > *').remove();

        this.userType(resp[1], '#chart', 'tool_radial');
        this.legends(resp[1], '#lgnUsrtype');
        this.total_usr_type = resp[0];

        d3.selectAll('#lgnUsrtype_expand > *').remove();

        this.userType(resp[1], '#chart_expand', 'tool_radial_expand');
        this.legends(resp[1], '#lgnUsrtype_expand');
      } else {
        this.chart_usr_type = false;
        this.total_usr_type = resp[0];
        d3.selectAll('#chart >*').remove();
        d3.selectAll('#lgnUsrtype >*').remove();


      }
    });

    //buil treemap _usrByChannel
    this._usrService.get_usrByChannel(this.i_date, this.f_date).subscribe(resp => {
      if (resp[2] > 0) {
        this.chart_usr_channel = true;
        d3.selectAll('#lgnChannel > *').remove();
        this.treeMap(resp[1], '#chartChannel', 'toolChannel', resp[2]);
        this.legends(resp[0], '#lgnChannel');
        this.total_usr_channel = resp[2];

        d3.selectAll('#lgnChannel_expand > *').remove();
        this.treeMap(resp[1], '#chartChannel_expand', 'toolChannel_expand', resp[2]);
        this.legends(resp[0], '#lgnChannel_expand');
      } else {
        this.chart_usr_channel = false;
        this.total_usr_channel = resp[2];
        d3.selectAll('#chartChannel >*').remove();
        d3.selectAll('#lgnChannel >*').remove();
      }
    });

    //buil treemap _bbyByChannel
    this._usrService.get_bbyByChannel(this.i_date, this.f_date).subscribe(resp => {
      if (resp[2] > 0) {
        this.chart_bby_channel = true;
        d3.selectAll('#lgnChannelbby > *').remove();

        this.treeMap(resp[1], '#chartChannelbby', 'tooltipChannelBby', resp[2]);
        this.legends(resp[0], '#lgnChannelbby');

        this.total_bby_type = resp[2];

        d3.selectAll('#lgnChannelbby_expand > *').remove();

        this.treeMap(resp[1], '#chartChannelbby_expand', 'tooltipChannelBby_expand', resp[2]);
        this.legends(resp[0], '#lgnChannelbby_expand');
      } else {
        this.chart_bby_channel = false;
        this.total_bby_type = resp[2];
        d3.selectAll('#chartChannelbby >*').remove();
        d3.selectAll('#lgnChannelbby >*').remove();
      }

    });

    //progress bar_chart
    this._usrService.get_bbyAtencion(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_bby_type = true;
        this.bby_atencion = resp;
        this.progress_dta_build(resp[1]);
      } else {
        this.chart_bby_type = false;
      }
    });

    //build line chartType
    this._usrService.get_semanaGestacion(this.i_date, this.f_date).subscribe(resp => {

      if (resp[0] > 0) {
        this.chart_sg = true;
        this.chart_line(resp[1], '#chart_line');
        this.chart_line(resp[1], '#chart_line_expand');
      }
      else {
        this.chart_sg = false;
        d3.selectAll('#chart_line >*').remove();
      }
    });
  }


  varChangeUser() {

    switch (this.op_user) {
      case 'mAge':
        this._usrService.get_momAge(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_usr = true;
            this.bar_chart(resp[1], '#chartusr', 'generalusr', true, 'tool_usr');
            this.totalUsr = resp[0];
            d3.selectAll('#lgn_bar_usr > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_usr');
            d3.selectAll('#chartusr_expand > svg > g > *').remove();
            this.bar_chart(resp[1], '#chartusr_expand', 'generalusr_expand', true, 'tool_usr_expand');
            d3.selectAll('#lgn_bar_usr_expand > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_usr_expand');
          } else {
            this.chart_usr = false;
            this.totalUsr = resp[0];
            d3.selectAll('#chartusr > *').remove();
            d3.selectAll('#lgn_bar_usr > *').remove();
          }


        });
        break;
      case 'tAten':

        this._usrService.get_tAten(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_usr = true;
            this.bar_chart(resp[1], '#chartusr', 'generalusr', false, 'tool_usr');
            this.totalUsr = resp[0];
            d3.selectAll('#lgn_bar_usr > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_usr');

            this.bar_chart(resp[1], '#chartusr_expand', 'generalusr_expand', false, 'tool_usr_expand');

            d3.selectAll('#lgn_bar_usr_expand > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_usr_expand');
          } else {
            this.chart_usr = false;
            this.totalUsr = resp[0];
            d3.selectAll('#chartusr > *').remove();
            d3.selectAll('#lgn_bar_usr > *').remove();
          }

        });
        break;

    }

  }
  varChangeBaby() {


    switch (this.op_baby) {
      case 'bAge':
        this._usrService.get_bbyAge(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_bby = true;
            this.bar_chart(resp[1], '#chartbby', 'generalbby', false, 'tool_bby');
            this.totalBby = resp[0];
            d3.selectAll('#lgn_bar_bby > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_bby');


            this.bar_chart(resp[1], '#chartbby_expand', 'generalbby_expand', false, 'tool_bby_expand');

            d3.selectAll('#lgn_bar_bby_expand > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_bby_expand');
          } else {
            this.chart_bby = false;
            this.totalBby = resp[0];
            d3.selectAll('#chartbby > *').remove();
            d3.selectAll('#lgn_bar_bby > *').remove();
          }
        });
        break;
      case 'bMom':
        this._usrService.get_bbyMage(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_bby = true;
            this.bar_chart(resp[1], '#chartbby', 'generalbby', true, 'tool_bby');
            this.totalBby = resp[0];
            d3.selectAll('#lgn_bar_bby > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_bby');

            d3.selectAll('#chartbby_expand > svg > g > *').remove();
            this.bar_chart(resp[1], '#chartbby_expand', 'generalbby_expand', true, 'tool_bby_expand');

            d3.selectAll('#lgn_bar_bby_expand > *').remove();
            this.legends_bar(resp[1], '#lgn_bar_bby_expand');
          } else {
            this.chart_bby = false;
            this.totalBby = resp[0];
            d3.selectAll('#chartbby > *').remove();
            d3.selectAll('#lgn_bar_bby > *').remove();
          }

        });
        break;

    }

  }


  bar_chart(data, grafico, gtext, xAxi: boolean, tool_tip) {

    //save data to csv
    let csv_dta = [];
    for (let dato of data) {
      let objeto = {
        seccion: "usuarios",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "",
        subvariable: 'N/A',
        campo: '',
        total: 0

      }

      if (grafico == '#chartusr') {

        objeto.variable = "Todos los usuarios ";
        if (this.op_user == "mAge") {
          objeto.subvariable = "Edad mamá";
        }
        else {
          objeto.subvariable = "Atención médica";
        }
      }
      if (grafico == '#chartbby') {
        objeto.variable = "Total de bebés";
        if (this.op_baby == "bAge") {
          objeto.subvariable = "Edad bebé (meses)";
        }
        else {
          objeto.subvariable = "Edad mamá";
        }
      }

      objeto.campo = dato.name;
      objeto.total = dato.value;
      csv_dta.push(objeto);

    }

    if (grafico == '#chartusr') {

      this.c_usr_dta = csv_dta;
    }
    if (grafico == '#chartbby') {
      this.c_bby_dta = csv_dta;
    }

    // start build chart
    d3.selectAll(grafico + '> *').remove();
    const grafica = d3.select(grafico).append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid')
      .attr('id', 'svg_' + grafico)
      .append('g')
      .attr('id', gtext)
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    d3.select(grafico).append('div')
      .attr('id', tool_tip)
      .attr('class', 'tooltipMapa');
    const tool = d3.select('#' + tool_tip);
    const colores = this.RangoColores;
    const names = [];
    const values = [];
    for (const dato of data) {
      names.push(dato.name);
      values.push(dato.value);
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

    if (xAxi == true) {
      grafica.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height2 + ')')
        .call(xAxis);

    } else {
      grafica.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height2 + ')')
        .append('rect')
        .attr('width', this.width * .8)
        .attr('height', '.3px');

    }


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

        return y_scale(d.value);
      })
      .transition()
      .duration(1500)
      .attr('height', function(d: any) {

        return altura - y_scale(d.value);
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
        return y_scale(d.value) - 5;
      })
      .attr('font-size', 14)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none');

    function texto(d) { return d.value; }
    function x_escla(d) {
      return x_scale(d.name);
    }
    function x_esclat(d) {
      return x_scale(d.name) + x_scale.bandwidth() / 2;
    }

    function showTooltip(d) {
      const left = d3.mouse(this)[0] - 30 + 'px';
      const top = d3.mouse(this)[1] - 30 + 'px';

      tool.style('left', '41%')
        .style('top', '73%')
        .style('display', 'inline-block')
        .html(d.name);
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }
  }

  //treemap
  treeMap(data, grafico, tooltip, total) {
    // save to csv
    let numberPipe = this.decimalPipe;
    let csv_dta = [];
    for (let dato of data.children) {
      let objeto = {
        seccion: "usuarios",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "",
        subvariable: 'N/A',
        campo: '',
        total: 0

      }
      if (grafico == '#chartChannel') {

        objeto.variable = "Todos los usuarios por medio";
      }
      if (grafico == '#chartChannelbby') {

        objeto.variable = "Total de bebés por medio";
      }

      objeto.campo = dato.name;
      objeto.total = dato.size;
      csv_dta.push(objeto);

    }

    if (grafico == '#chartChannel') {

      this.ct_usr_dta = csv_dta;
    }
    if (grafico == '#chartChannelbby') {

      this.ct_bby_dta = csv_dta;
    }

    // start build chart
    d3.selectAll(grafico + '> *').remove();
    const grafica = d3.select(grafico)
      .append('svg')
      .attr('id', 'svg_' + grafico)
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
      .transition()
      .duration(2000)
      .attr('height', function(d: any) { return d.y1 - d.y0; })
      .attr('stroke', 'white')
      .attr('stroke-width', 0.7)
      .attr('fill', function(d, i) {
        return colores[i];
      });
    cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
      .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

    cell.append('text')
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
      .selectAll('tspan')
      .data(function(d) { return d.data.name_box.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append('tspan')
      .attr('x', 10)
      .attr('y', function(d, i) { return 20 + i * 10; })
      .text(function(d: any) { return d; })
      .attr('fill', '#fff')
      .attr('font-family', 'Open Sans')
      .attr('font-size', '15.px')
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
      const top = d3.mouse(this)[1] - 5 + 'px';

      tool.style('left', '35%')
        .style('top', '73%')
        .style('display', 'inline-block')
        .html(d.data.name + ':\n' + numberPipe.transform(d.data.size));
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }

  }

  // legend for radial
  legends(data, lgnd: string) {

    const colores = this.RangoColores;
    const valores = [];
    for (const dta of data) {
      valores.push(this.fmiles_pipe.transform(dta.count));
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
        return d.group + ': ' + valores[i];
      });
  }

  //-------
  legends_bar(data, lgnd: string) {

    const colores = this.RangoColores;
    const valores = [];
    for (const dta of data) {
      valores.push(this.fmiles_pipe.transform(dta.value));
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
      });
  }
  // radial chart

  userType(data, grafico, tool_radial) {

    let csv_dta = [];
    for (let dato of data) {
      let objeto = {
        seccion: "usuarios",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: " Todos los usarios por tipo",
        subvariable: 'N/A',
        campo: '',
        total: 0

      }
      objeto.campo = dato.group;
      objeto.total = dato.count;
      csv_dta.push(objeto);

    }

    this.cr_usr_dta = csv_dta;

    d3.selectAll(grafico + '> *').remove();
    const grafica = d3.select(grafico)
      .append('svg')
      .attr('id', 'svg_' + grafico)
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid')
      .append('g')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');

    d3.select(grafico).append('div')
      .attr('id', tool_radial)
      .attr('class', 'tooltipMapa');

    const colores = this.RangoColores;
    const tool = d3.select('#' + tool_radial);
    const valores = [];
    for (const valor of data) {
      valores.push(valor.count);
    }
    const PI = Math.PI,
      arcMinRadius = 40,
      arcPadding = 10,
      labelPadding = -5,
      numTicks = 10;

    const scale = d3.scaleLinear()
      .domain([0, d3.max(valores) * 1.1])
      .range([0, 2 * PI]);

    const ticks = scale.ticks(numTicks).slice(0, -1);
    const keys = data.map((d, i) => d.group);
    //number of arcs
    const numArcs = keys.length;
    const arcWidth = (this.chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

    const arc = d3.arc()
      .innerRadius((d, i) => {

        return getInnerRadius(i);
      })
      .outerRadius((d, i) => getOuterRadius(i))
      .startAngle(0)
      .endAngle((d: any, i) => scale(d));
    const arcs = grafica.append('g')
      .attr('class', 'data')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'arc')
      .style('fill', function(d, i) {
        return colores[i];
      })

      .on('mousemove', showTooltip)
      .on('mouseout', hideTooltip);


    arcs.transition()
      .delay((d, i) => i * 200)
      .duration(1000)
      .attrTween('d', arcTween);

    grafica.selectAll('path')
      .data(data)
      ;



    function arcTween(d, i) {
      const interpolate = d3.interpolate(0, d.count);

      return t => arc(interpolate(t), i);
    }

    function showTooltip(d) {


      const left = d3.mouse(this)[0] - 15 + 'px';
      const top = d3.mouse(this)[1] - 250 + 'px';


      tool.style('left', '35%')
        .style('top', '73%')
        .style('display', 'inline-block')
        .html(d.group + ': ' + d.count);
    }
    function hideTooltip() {
      tool.style('display', 'none');
    }

    function rad2deg(angle) {
      return angle * 180 / PI;
    }

    function getInnerRadius(index) {

      return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
    }

    function getOuterRadius(index) {
      return getInnerRadius(index) + arcWidth;
    }


  }

  chart_line(dta: any, grafico) {

    let csv_dta = [];
    for (let dato of dta) {
      let objeto = {
        seccion: "usuarios",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "Total de bebés por semana de gestación al nacer ",
        subvariable: 'N/A',
        campo: 'semana ',
        total: 0

      }
      objeto.campo = objeto.campo + dato.year;
      objeto.total = dato.value;
      csv_dta.push(objeto);

    }
    this.c_line_dta = csv_dta;

    //start build chart
    d3.selectAll(grafico + ' > *').remove();
    const grafica = d3.select(grafico)
      .append('svg')
      .attr('id', 'svg_c_line')
      .attr('viewBox', '0 0 800 300')
      .attr('preserveAspectRatio', 'xMidYMid');
    const years = [];
    for (const dto of dta) {
      years.push(parseInt(dto.year));
    }
    const data = [];

    for (let i = d3.min(years); i <= d3.max(years); i++) {
      const objeto = {
        year: '',
        value: 0
      };
      for (const dto of dta) {
        if (dto.year == i) {
          objeto.year = dto.year;
          objeto.value = dto.value;
          data.push(objeto);
        }
      }


    }
    const height = 200;
    const width = 700;
    const parseTime = d3.timeParse('%Y');
    const bisectDate = d3.bisector(function(d: any) { return d.year; }).left;

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const x2 = d3.scaleLinear().range([0, width]);
    const dta2 = data;
    const line = d3.line()
      .x(function(d: any) { return x(d.year); })
      .y(function(d: any) { return y(d.value); });

    const g = grafica.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    data.forEach(function(d: any) {
      d.year = parseTime(d.year);
      d.value = +d.value;
    });

    x2.domain([d3.min(years), d3.max(years)]);
    x.domain(d3.extent(data, function(d: any) { return d.year; }));
    y.domain([d3.min(data, function(d: any) { return d.value; }) / 1.005, d3.max(data, function(d) { return d.value; }) * 1.005]);

    g.append('g')
      .attr('class', 'axis axis--x ')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x2).ticks(years.length - 1))
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', '50%')
      .attr('y', 40)
      .attr('dx', '.71em')
      .style('text-anchor', 'end')
      .attr('fill', '#00556b')
      .attr('font-size', '15px')
      .text('Semanas de gestación');

    g.append('g')
      .attr('class', 'axis axis--y grid')
      .call(d3.axisLeft(y).tickSize(-width).ticks(6))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('x', '-4%')
      .attr('y', -40)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .attr('fill', '#00556b')
      .attr('font-size', '15px')
      .text('Total de nacimientos');


    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#58e8c5')
      .attr('stroke-width', '2px')
      .attr('d', line);


    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', height);

    focus.append('line')
      .attr('class', 'y-hover-line hover-line')
      .attr('x1', width)
      .attr('x2', width);

    focus.append('circle')
      .attr('r', 7.5);

    focus.append('text')
      .attr('x', 15)
      .attr('dy', '.31em');

    grafica.append('rect')
      .attr('transform', 'translate(' + 40 + ',' + 20 + ')')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .on('mouseover', function() { focus.style('display', null); })
      .on('mouseout', function() { focus.style('display', 'none'); })
      .on('mousemove', mousemove);

    // 12. Appends a circle for each datapoint
    grafica.selectAll('.dot')
      .data(data)
      .enter().append('circle') // Uses the enter().append() method
      .attr('fill', '#1cd5a7')
      .attr('stroke', '#fff')  // Assign a class for styling
      .attr('cx', function(d) { return x(d.year) + 40; })
      .attr('cy', function(d) { return y(d.value) + 20; })
      .attr('r', 5);

    function mousemove() {
      const x0: any = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0: any = data[i - 1],
        d1: any = data[i],
        d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr('transform', 'translate(' + x(d.year) + ',' + y(d.value) + ')');
      focus.select('text').text(function() { return d.value; });
      focus.select('.x-hover-line').attr('y2', height - y(d.value));
      focus.select('.y-hover-line').attr('x2', width + width);
    }
  }

  help_enter(opcion) {
    const opciones = ['#help_usr', '#help_usr_channel', '#help_usr_type', '#help_bby', '#help_bby_channel', '#help_bby_type', '#help_sg'];
    if (opcion == 0) {

      if (this.op_user == 'mAge') {
        this.help_usr = 'Total de usuarias por edad. ';
      } else {
        this.help_usr = 'Total de usuarias por lugar donde reportan recibir atención médica.';
      }


    }
    if (opcion == 3) {
      if (this.op_baby == 'bAge') {
        this.help_bby = 'Total de bebés por edad en meses.';
      } else {
        this.help_bby = 'Total de bebés por edad de su mamá.';
      }
    }



    const help = d3.select(opciones[opcion]);
    help.style('display', 'inline');

  }
  help_out(opcion) {
    const opciones = ['#help_usr', '#help_usr_channel', '#help_usr_type', '#help_bby', '#help_bby_channel', '#help_bby_type', '#help_sg'];
    const help = d3.select(opciones[opcion]);
    help.style('display', 'none');
  }



  descarga(grafica, leyenda, name) {

    let title = '';
    let legend = '';
    let help = '';
    const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });
    let lgn = d3.select(leyenda).html();
    switch (grafica) {
      case '#chartusr':
        title = 'Todos los usuarios';
        if (this.op_user == "mAge") {
          help = this.help_usr;
        }
        else {
          help = "Total de usuarias por ligar donde reportan recibir atención médica";
        }

        break;
      case '#chartChannel':
        title = 'Todos los usuarios por medio (' + this.total_usr_channel + ' )';
        help = 'Total de usuarias por medio en el cual están inscritas a misalud.';



        break;
      case '#chart':
        title = 'Todos los usarios por tipo';
        help = 'Total de usuarias por tipo (embarazo, mamá o prestador de servicios de salud).';


        break;
      case '#chartbby':
        title = 'Total de bebés';

        if (this.op_baby == "bAge") {
          help = this.help_bby;
        }
        else {
          help = "Total de bebés por edad de su mamá";
        }


        break;
      case '#chartChannelbby':
        title = 'Total de bebés por medio';
        help = 'Total de bebés por medio en el cual sus mamás están inscritas.';


        break;
      case '#chart_line':
        title = 'Total de bebés por semana de gestación al nacer';
        help = 'Total de usuarias embarazadas por semana de gestación';

        break;

    }

    const h_img = this._headerService.headerimg;
    const f_img = this._headerService.footerimg;

    d3.select('#c_bloqueo').style('display', 'block');

    const cambio = d3.select(grafica + '> svg');
    cambio.attr('viewBox', null);
    cambio.attr('preserveAspectRatio', null);
    cambio.attr('width', '400');
    cambio.attr('height', '300');

    //variables texto

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
        doc.save(name + '.pdf');
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

  descarga_progress() {

    const h_img = this._headerService.headerimg;
    const f_img = this._headerService.footerimg;
    var title = "Atención médica",
      help = "Tota de bebés por lugar donde la mamá reporta recibir atención médica."
    let lgn = d3.select('#chart_progres').html();
    d3.select('#c_bloqueo').style('display', 'block');
    d3.select("#i_title").append('p').attr('class', 'title_impresion').text(title);
    d3.select("#i_help").append('p').attr('class', 'help_impresion').text(help);
    d3.select("#i_legend").append('div').html(lgn);

    html2canvas(document.getElementById('c_impresion'), { scale: 1 }).then(function(canvas) {
      const img2 = canvas.toDataURL('image/png');
      const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });
      doc.addImage(h_img, 'JPEG', 5.5, 0);
      doc.addImage(img2, 'JPEG', 55, 100);
      doc.addImage(f_img, 'PNG', 5.5, 255);
      doc.autoPrint();
      doc.save('atencionMedica.pdf');
      d3.selectAll('#i_help >* ').remove();
      d3.selectAll('#i_title >* ').remove();
      d3.selectAll('#i_img >* ').remove();
      d3.selectAll('#i_legend >* ').remove();


      d3.select('#c_bloqueo').style('display', 'none');



    });



  }

  descarga_line() {
    const h_img = this._headerService.headerimg;
    const f_img = this._headerService.footerimg;
    const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });
    var lines,
      title = "Total de bebés por semana de gestación al nacer",
      help = "Tota de usuarios embarazadas por semana de gestación."

    d3.select('#c_bloqueo_l').style('display', 'block');

    const cambio = d3.select('#chart_line > svg');
    cambio.attr('viewBox', null);
    cambio.attr('preserveAspectRatio', null);
    cambio.attr('width', '800');
    cambio.attr('height', '300');
    const svgString = new XMLSerializer().serializeToString(document.querySelector('#chart_line> svg'));
    d3.select('#i_img_l').append('canvas').attr('id', 'canvas').attr('width', 800).attr('height', 300);
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
    d3.select("#i_title_l").append('p').attr('class', 'title_impresion').text(title);
    d3.select("#i_help_l").append('p').attr('class', 'help_impresion').text(help);

    const impresion = setTimeout(() => {
      imprimir();
    }, 2000);

    function imprimir() {
      html2canvas(document.getElementById('c_impresion_l'), { scale: 1 }).then(function(canvas) {

        const img2 = canvas.toDataURL('image/png');

        doc.addImage(h_img, 'JPEG', 5.5, 0);
        doc.addImage(img2, 'JPEG', 4, 100);
        doc.addImage(f_img, 'PNG', 5.5, 255);
        doc.autoPrint();
        doc.save('semanasGestacion.pdf');
        d3.selectAll('#i_help_l >* ').remove();
        d3.selectAll('#i_title_l >* ').remove();
        d3.selectAll('#i_img_l >* ').remove();
        d3.selectAll('#i_legend_l >* ').remove();
        d3.select('#chart_line > svg')
          .attr('width', null)
          .attr('height', null)
          .attr('viewBox', '0 0 800 300')
          .attr('preserveAspectRatio', 'xMidYMid');

        d3.select('#c_bloqueo_l').style('display', 'none');



      });
    }
  }

  generate_csv() {

    let dta = [this.c_usr_dta,
    this.ct_usr_dta,
    this.ct_bby_dta,
    this.cr_usr_dta,
    this.c_bby_dta,
    this.c_line_dta,
    this.c_progress_dta]
    this._generateService.generate(dta, 'usuarios');

  }

  progress_dta_build(data) {

    let csv_dta = [];
    for (let dato of data) {
      let objeto = {
        seccion: "usuarios",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "Atención médica ",
        subvariable: 'N/A',
        campo: '',
        total: 0

      }
      objeto.campo = dato.key;
      objeto.total = dato.count;
      csv_dta.push(objeto);

    }
    this.c_progress_dta = csv_dta;

  }


  device() {
    //console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //console.log(this.deviceInfo);

  }



}
