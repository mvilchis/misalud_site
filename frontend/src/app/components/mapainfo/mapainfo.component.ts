import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MapainfoService } from '../../services/mapainfo.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderService } from '../../services/header.service';
import { MapainfoChartService } from '../../services/mapainfo-chart.service';
import { ISubscription } from 'rxjs/Subscription';
import { DatemapaService } from '../../services/datemapa.service';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import * as $ from 'jquery';
import { DeviceDetectorService } from 'ngx-device-detector';
import { fmilesPipe } from '../../pipes/fmiles.pipe';
import { GCsvService } from '../../services/g-csv.service';




@Component({
  selector: 'app-mapainfo',
  templateUrl: './mapainfo.component.html',
  providers: [fmilesPipe]
})
export class MapainfoComponent implements OnInit {
  deviceInfo = null;
  datos: any;
  v_estatal = 0;
  v_municipal = 0;
  v_nacioal = 0;
  v_estatal_two = 0;
  v_municipal_two = 0;
  v_nacioal_two = 0;
  info: any;
  info_two: any;
  variable = 'none';
  estado = 'none';
  municipio = 'none';
  encabezado = 1;
  estados = [];
  municipios = [];
  values = [];
  varText = '';
  values_chart = [];
  public svg;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  //  public chart_width = 860 - this.margin.left - this.margin.right;
  //  public chart_height = 300 - this.margin.top - this.margin.bottom;
  public chart_width = 700;
  public chart_height = 200;
  loading = true;
  invalido = false;
  helps_option;
  help_text = '';
  chart_dta = true;
  private subscription: ISubscription;

  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  meses_inicio = [];
  meses_fin = [];
  i_mes = '1';
  i_year = '2016';
  f_mes = 'none';
  f_year = 'none';
  years_fin = [];
  years_inicio = [];
  i_date = 'none';
  f_date = 'none';
  name_estado = '';
  name_municipio = '';
  data_backup: any;

  line_chart = [];
  chart_years = [];
  chart_data = [4, 10, 30];

  //------------------------------------
  opcionsub = 'none';
  opcionsub_two = 'none';
  subvariable = [];
  subvariable_two = [];
  imprimiendo = false;
  years = [];

  dta_csv;



  constructor(
    private activatedRoute: ActivatedRoute,
    public _mapaService: MapainfoService,
    public http: HttpClient,
    public _headerService: HeaderService,
    public _mchart: MapainfoChartService,
    public _dateSer: DatemapaService,
    private router: Router,
    private deviceService: DeviceDetectorService,
    public _generateService: GCsvService,
    private fmiles_pipe: fmilesPipe) {

    this._headerService.encabezado = 0;
  }

  ngOnInit() {
    this.device();
    //servicios de mapa

    if (this._dateSer.t_data == 0) {
      this.router.navigate(['/mapa']);
      return;
    }

    this.i_year = this._dateSer.i_year;
    this.i_mes = this._dateSer.i_mes;
    this.f_year = this._dateSer.f_year;
    this.f_mes = this._dateSer.f_mes;
    this.estado = this._dateSer.estado;
    this.opcionsub = this._dateSer.opcionsub;
    this.variable = this._dateSer.variable;

    //charge variables
    this.subvariable = this._mapaService.subvariable;
    this.subvariable_two = this._mapaService.subvariable_two;
    //charge states of mexico
    this._mapaService.cargaEstados().subscribe((resp: any) => {

      this.estados = resp;
    });
    //----------------set dates --------------------

    this._mapaService.carga_help().subscribe(resp => {
      this.helps_option = resp;
    });
    this.builDates();


    //Generate labes of  linear chart

    this.varChange(1);

  }

  ngOnDestroy() {
    if (this._dateSer.t_data == 1) {
      this.subscription.unsubscribe();
    }
  }


  //bild years 2016 to now year
  builDates() {
    const now = new Date();
    const nowYear = now.getFullYear();
    const mes = now.getMonth();

    this.i_date = `${this.i_year}-${this.i_mes}-01T00:00:00`;
    this.f_date = `${this.f_year}-${this.f_mes}-28T00:00:00`;


    const years = [];
    for (let y = parseInt(this.i_year); y <= parseInt(this.f_year); y++) {
      years.push(y);
    }
    const meses = [];
    for (let i = 0; i < mes + 1; i++) {
      meses.push(this.meses[i]);
    }

    if (parseInt(this.i_year) == nowYear) {

      this.meses_inicio = meses;
      if (parseInt(this.i_mes) > (meses.length) + 1) {
        this.i_mes = '1';
      }
    } else {
      this.meses_inicio = this.meses;
    }

    if (parseInt(this.f_year) == nowYear) {

      this.meses_fin = meses;
      if (parseInt(this.f_mes) > (meses.length) + 1) {
        this.f_mes = '1';
      }
    } else {
      this.meses_fin = this.meses;
    }


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
    this.varChange(1);
  }
  changeMonth(select) {
    const dt = new Date();
    const year = dt.getFullYear() + '';
    const mes = dt.getMonth();
    const meses = [];


    if (select == 1) {
      if (this.i_year == year) {
        for (let i = 0; i < mes + 1; i++) {
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
        for (let i = 0; i < mes + 1; i++) {
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
  //change name of table and title
  chageVarName() {

    for (const name of this.subvariable) {
      if (name.value == this.opcionsub) {
        this.varText = name.texto;
      }
    }
    if (this.opcionsub == 'none' || this.opcionsub == 'users') {
      this.varText = 'Todos los usuarios';
    }

    if (this.variable == 'bby') {
      this.varText = 'Todos los bebés';
    }


  }

  //change firts select
  changeVar() {

    switch (this.variable) {
      case 'usr':
        //all usrs
        this._mapaService.getAllUsers(this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, 1);

        });
        this._mapaService.get_nacional(this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        this.opcionsub = 'users';


        break;

      case 'bby':
        this._mapaService.getBbyState(this.i_date, this.f_date).subscribe(resp => {

          this.v_nacioal = resp[0];


          this.build_text(resp, 1);
        });
        this.opcionsub = 'bbyState';

        break;
    }

  }

  //asignacion de variables
  build_text(data, section) {

    if (section == 1) {
      //this.v_nacioal=data[0];
      this.info = data[1];
      this.chageVarName();

      if (this.estado != 'none') {
        this.valorEstatal();
      } else {
        this.change_chart();
      }

    } else {

      this.info_two = data[1];
      //  this.v_nacioal_two=data[0];
      this.chageVarName();
      if (this.estado != 'none') {
        this.valorEstatal_two();
      }

    }


  }


  //------------funcion change select subvariable
  varChange(variable) {

    let search;
    if (variable == 1) {

      search = this.opcionsub;
    } else {
      if (this.opcionsub_two == 'none') {
        this.v_nacioal_two = 0;
        this.v_estatal_two = 0;
        this.v_municipal_two = 0;
      }

      search = this.opcionsub_two;

    }
    this.municipio = 'none';
    this.v_municipal = 0;
    this.v_municipal_two = 0;

    switch (search) {

      //todos los usuarios
      case 'users':
        this._mapaService.getAllUsers(this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);

        });
        if (variable == 1) {
          this._mapaService.get_nacional(this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_nacional(this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });

        }

        break;

      case 'tPregnal':
        this._mapaService.getPregnals(this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allType('pregnant').subscribe(resp => {
            this.v_nacioal = resp;
          });

        }
        if (variable == 2) {
          this._mapaService.get_allType('pregnant').subscribe(resp => {
            this.v_nacioal_two = resp;
          });

        }

        break;

      case 'tMomBby':
        this._mapaService.getMomBby(this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allType('baby').subscribe(resp => {
            this.v_nacioal = resp;
          });

        }
        if (variable == 2) {
          this._mapaService.get_allType('baby').subscribe(resp => {
            this.v_nacioal_two = resp;
          });

        }

        break;
      case 'tPrestador':
        this._mapaService.getPrestador(this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allType('personal').subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allType('personal').subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'm18':
        this._mapaService.getMom(0, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);

        });
        if (variable == 1) {
          this._mapaService.get_allMage(0, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allMage(0, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'm35':
        this._mapaService.getMom(1, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allMage(1, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allMage(1, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'mMas':
        this._mapaService.getMom(2, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allMage(2, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allMage(2, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;

      case 'hImss':
        this._mapaService.getHospital(0, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(0, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(0, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hIsste':
        this._mapaService.getHospital(1, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(1, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(1, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hSP':
        this._mapaService.getHospital(2, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(2, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(2, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hInst':
        this._mapaService.getHospital(3, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(3, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(3, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hPemex':
        this._mapaService.getHospital(4, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(4, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(4, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hSedena':
        this._mapaService.getHospital(5, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(5, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(5, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hFarm':
        this._mapaService.getHospital(6, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(6, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(6, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hPrivado':
        this._mapaService.getHospital(7, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(7, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(7, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'hOtro':
        this._mapaService.getHospital(8, this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allAtencion(8, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allAtencion(8, this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'mSMS':
        this._mapaService.getMedio('sms', this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allChannel('sms', this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allChannel('sms', this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'mFB':
        this._mapaService.getMedio('facebook', this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);

        });
        if (variable == 1) {
          this._mapaService.get_allChannel('facebook', this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allChannel('facebook', this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;
      case 'mTW':
        this._mapaService.getMedio('twitter', this.i_date, this.f_date).subscribe(resp => {
          this.build_text(resp, variable);
        });
        if (variable == 1) {
          this._mapaService.get_allChannel('twitter', this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal = resp;
          });
        }
        if (variable == 2) {
          this._mapaService.get_allChannel('twitter', this.i_date, this.f_date).subscribe(resp => {
            this.v_nacioal_two = resp;
          });
        }

        break;

      case 'bbyState':
        this._mapaService.getBbyState(this.i_date, this.f_date).subscribe(resp => {
          if (variable == 1) {
            this.v_nacioal = resp[0];
          }
          if (variable == 2) {
            this.v_nacioal_two = resp[0];
          }

          this.build_text(resp, variable);
        });

        break;

    }



  }

  valorEstatal() {

    if (this.estado == 'none') {
      this.municipio = 'none';
      this.v_estatal = 0;
      this.v_municipal = 0;
      this.v_municipal_two = 0;
      this.change_chart();
    }


    let find = 0;
    const est = parseInt(this.estado);
    //console.log(this.info);
    for (const busqueda of this.info) {
      const bus = parseInt(busqueda.cve_ent);
      //console.log(bus);
      if (bus == est) {

        find = 1;
        this.v_estatal = busqueda.count;
        for (const state of this.estados) {
          if (state.cve_ent == est) {
            this.name_estado = state.nom_ent;
          }

        }
        this.change_chart();

      }
    }
    for (const state of this.estados) {
      if (state.cve_ent == est) {
        if (find == 0) {

          this.v_estatal = 0;
          this.chart_dta = false;
          this.loading = false;
          d3.selectAll('#chart >*').remove();
        }
        this.name_estado = state.nom_ent;
      }


    }
    //busqueda estado segunda variable
    if (this.opcionsub_two != 'none') {

      for (const busqueda of this.info_two) {
        const bus = parseInt(busqueda.cve_ent);
        //console.log(bus);
        if (bus == est) {
          this.v_estatal_two = busqueda.count;

        }
      }
    }

    this.municipio = 'none';

    // carga de munucipios

    switch (this.opcionsub) {
      //todos los usuarios
      case 'users':
        this._mapaService.mun_getAllUsers(this.estado, this.i_date, this.f_date).subscribe(resp => {

          this.mun_build(resp);
        });
        break;

      case 'tPregnal':
        this._mapaService.mun_getPregnals(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'tMomBby':
        this._mapaService.mun_getMomBby(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'tPrestador':
        this._mapaService.mun_getPrestador(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'm18':
        this._mapaService.mun_getMom(0, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'm35':
        this._mapaService.mun_getMom(1, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'mMas':
        this._mapaService.mun_getMom(2, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;

      case 'hImss':
        this._mapaService.mun_getHospital(0, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hIsste':
        this._mapaService.mun_getHospital(1, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hSP':
        this._mapaService.mun_getHospital(2, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hInst':
        this._mapaService.mun_getHospital(3, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hPemex':
        this._mapaService.mun_getHospital(4, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hSedena':
        this._mapaService.mun_getHospital(5, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hFarm':
        this._mapaService.mun_getHospital(6, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hPrivado':
        this._mapaService.mun_getHospital(7, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'hOtro':
        this._mapaService.mun_getHospital(8, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'mSMS':
        this._mapaService.mun_getMedio('sms', this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'mFB':
        this._mapaService.mun_getMedio('facebook', this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;
      case 'mTW':
        this._mapaService.mun_getMedio('twitter', this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;

      case 'bbyState':
        this._mapaService.mun_getbbyState(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.mun_build(resp);
        });
        break;


    }

  }

  change_mun() {


    if (this.municipio != 'none') {
      for (const mun of this.municipios) {
        if (this.municipio == mun.cve_comb) {
          this.v_municipal = mun.count;
          this.name_municipio = mun.nom_mun;

        }
      }
      this.change_chart_mun();
      this.valorEstatal_two();
    }
    else {
      this.v_municipal = 0;
      this.v_municipal_two = 0;
      this.change_chart();
    }


  }


  mun_build(datos) {

    this._mapaService.cargaMunicipios(this.estado).subscribe(resp => {

      const result = [];
      for (const dta of datos) {
        const objeto = {
          'cve_comb': '',
          'nom_mun': '',
          'count': 0
        };
        for (const mun of resp) {
          if (dta.cve_comb == mun.cve_comb) {
            objeto.cve_comb = dta.cve_comb;
            objeto.nom_mun = mun.nom_mun;
            objeto.count = dta.count;
            result.push(objeto);
          }

        }
      }

      this.municipios = result;


    });

  }

  valorEstatal_two() {

    const est = parseInt(this.estado);
    for (const busqueda of this.info_two) {
      const bus = parseInt(busqueda.cve_ent);
      //console.log(bus);
      if (bus == est) {
        this.v_estatal_two = busqueda.count;

      }
    }

    switch (this.opcionsub_two) {
      //todos los usuarios
      case 'users':
        this._mapaService.mun_getAllUsers(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;

      case 'tPregnal':
        this._mapaService.mun_getPregnals(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'tMomBby':
        this._mapaService.mun_getMomBby(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'tPrestador':
        this._mapaService.mun_getPrestador(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'm18':
        this._mapaService.mun_getMom(0, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'm35':
        this._mapaService.mun_getMom(1, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'mMas':
        this._mapaService.mun_getMom(2, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;

      case 'hImss':
        this._mapaService.mun_getHospital(0, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hIsste':
        this._mapaService.mun_getHospital(1, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hSP':
        this._mapaService.mun_getHospital(2, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hInst':
        this._mapaService.mun_getHospital(3, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hPemex':
        this._mapaService.mun_getHospital(4, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hSedena':
        this._mapaService.mun_getHospital(5, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hFarm':
        this._mapaService.mun_getHospital(6, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hPrivado':
        this._mapaService.mun_getHospital(7, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'hOtro':
        this._mapaService.mun_getHospital(8, this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'mSMS':
        this._mapaService.mun_getMedio('sms', this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'mFB':
        this._mapaService.mun_getMedio('facebook', this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;
      case 'mTW':
        this._mapaService.mun_getMedio('twitter', this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;

      case 'bbyState':
        this._mapaService.mun_getbbyState(this.estado, this.i_date, this.f_date).subscribe(resp => {
          this.build_mun_two(resp);
        });
        break;


    }

  }

  build_mun_two(resp) {

    for (const value of resp) {
      if (value.cve_comb == this.municipio) {
        this.v_municipal_two = value.count;
      }
    }
  }

  change_chart() {

    switch (this.opcionsub) {

      //todos los usuarios
      case 'users':

        this.loading = true;
        this.subscription = this._mchart.years_allusers(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'tPregnal':


        this.loading = true;
        this.subscription = this._mchart.years_getPregnals(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'tMomBby':

        this.loading = true;
        this.subscription = this._mchart.years_getMomBby(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'tPrestador':



        this.loading = true;
        this.subscription = this._mchart.years_getPrestador(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'm18':

        this.loading = true;
        this.subscription = this._mchart.years_getMom(0, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'm35':


        this.loading = true;


        this.subscription = this._mchart.years_getMom(1, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mMas':


        this.loading = true;
        this.subscription = this._mchart.years_getMom(2, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'hImss':


        this.loading = true;
        this.subscription = this._mchart.years_getHospital(0, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hIsste':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(1, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hSP':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(2, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hInst':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(3, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hPemex':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(4, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hSedena':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(5, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hFarm':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(6, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hPrivado':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(7, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hOtro':

        this.loading = true;
        this.subscription = this._mchart.years_getHospital(8, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();
          this.chart_line(resp);

        });

        break;
      case 'mSMS':

        this.loading = true;
        this.subscription = this._mchart.years_getMedio('sms', this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mFB':

        this.loading = true;
        this.subscription = this._mchart.years_getMedio('facebook', this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mTW':

        this.loading = true;
        this.subscription = this._mchart.years_getMedio('twitter', this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'bbyState':

        this.loading = true;
        this.subscription = this._mchart.years_BbyState(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });



        break;





    }



  }


  change_chart_mun() {

    switch (this.opcionsub) {

      //todos los usuarios
      case 'users':

        this.loading = true;
        this.subscription = this._mchart.mun_years_allusers(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'tPregnal':


        this.loading = true;
        this.subscription = this._mchart.mun_years_getPregnals(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'tMomBby':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getMomBby(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'tPrestador':



        this.loading = true;
        this.subscription = this._mchart.mun_years_getPrestador(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'm18':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getMom(0, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'm35':


        this.loading = true;


        this.subscription = this._mchart.mun_years_getMom(1, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mMas':


        this.loading = true;
        this.subscription = this._mchart.mun_years_getMom(2, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'hImss':


        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(0, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hIsste':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(1, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hSP':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(2, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hInst':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(3, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hPemex':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(4, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hSedena':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(5, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hFarm':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(6, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hPrivado':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(7, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'hOtro':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getHospital(8, this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mSMS':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getMedio('sms', this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mFB':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getMedio('facebook', this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;
      case 'mTW':

        this.loading = true;
        this.subscription = this._mchart.mun_years_getMedio('twitter', this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });

        break;

      case 'bbyState':

        this.loading = true;
        this.subscription = this._mchart.mun_years_BbyState(this.i_year, this.i_mes, this.f_year, this.f_mes, this.estado, this.municipio).subscribe((resp: any) => {
          d3.select('#chart >*').remove();

          this.chart_line(resp);

        });



        break;





    }



  }

  chart_line(data) {
    this.help_build();
    this.loading = false;
    this.chart_dta = true;

    var es_mx = d3.timeFormatDefaultLocale({

      "dateTime": "%x, %X",
      "date": "%d/%m/%Y",
      "time": "%-I:%M:%S %p",
      "periods": ["AM", "PM"],
      "days": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      "shortDays": ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      "months": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    });

    d3.selectAll('#chart > *').remove();
    let svg = d3.select('#chart')
      .append('svg')
      .attr('id', 'svg_chart')

    if (this.deviceInfo.browser == "ie") {
      svg.attr("width", 800)
        .attr("height", 300);
    }
    else {
      svg.attr('viewBox', '0 0 800 300')
        .attr('preserveAspectRatio', 'xMidYMid');
    }



    let height = this.chart_height;
    let width = this.chart_width;



    let values = [];
    let years = [];

    for (let dato of data) {

      values.push(dato.value);
    }


    let parseTime = d3.timeParse("%Y-%m");
    let bisectDate = d3.bisector(function(d: any) { return d.year; }).left;

    let x = d3.scaleTime().range([5, width]);
    let y = d3.scaleLinear().range([height, 0]);
    let x2 = d3.scaleLinear().range([0, width]);
    let pipe = this.fmiles_pipe;


    let line = d3.line()
      .x(function(d: any) { return x(d.year); })
      .y(function(d: any) { return y(d.value); });

    let g = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    data.forEach(function(d: any) {
      d.year = parseTime(d.year + "-" + d.mes);
      years.push(d.year)
      //d.year = new Date(d.year, d.mes - 1);
      //  years.push(new Date(d.year, d.mes + 1));

      d.value = +d.value;
    });
    for (let dato of data) {

      years.push(dato.year);
      values.push(dato.value);
    }
    //let extend: any = d3.extent(data, function(d: any) { return d.year; });
    x2.domain([d3.min(years), d3.max(years)]);
    x.domain([d3.min(years), d3.max(years)]).nice();
    y.domain([d3.min(values) / 1.005, d3.max(values) * 1.005]);

    g.append('g')
      .attr('class', 'axis axis--x ')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%b-%Y")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    g.append('g')
      .attr('class', 'axis axis--y grid')
      .call(d3.axisLeft(y).tickSize(-width).ticks(6))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .attr('fill', '#5D6971');


    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#58e8c5')
      .attr('stroke-width', '2px')
      .attr('d', line);


    let focus = g.append('g')
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

    svg.append('rect')
      .attr('transform', 'translate(' + 40 + ',' + 20 + ')')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .on('mouseover', function() { focus.style('display', null); })
      .on('mouseout', function() { focus.style('display', 'none'); })
      .on('mousemove', mousemove);

    // 12. Appends a circle for each datapoint
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle') // Uses the enter().append() method
      .attr('fill', '#1cd5a7')
      .attr('stroke', '#fff') // Assign a class for styling
      .attr('cx', function(d: any) { return x(d.year) + 40; })
      .attr('cy', function(d: any) { return y(d.value) + 20; })
      .attr('r', 5);

    function mousemove() {
      let x0: any = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0: any = data[i - 1],
        d1: any = data[i],
        d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr('transform', 'translate(' + x(d.year) + ',' + y(d.value) + ')');
      focus.select('text').text(function() {

        return pipe.transform(d.value);
      });
      focus.select('.x-hover-line').attr('y2', height - y(d.value));
      focus.select('.y-hover-line').attr('x2', width + width);
    }

    this.subscription.unsubscribe();
  }


  help_enter(opcion) {
    const opciones = ['#help_table', '#help_line'];

    for (const op of this.helps_option) {
      if (op.opcion == this.opcionsub) {
        this.help_text = op.texto;
      }

    }

    const help = d3.select(opciones[opcion]);
    help.style('display', 'inline');
  }
  help_build() {

    for (const op of this.helps_option) {
      if (op.opcion == this.opcionsub) {
        this.help_text = op.texto;
      }

    }

  }
  help_out(opcion) {
    const opciones = ['#help_table', '#help_line'];
    const help = d3.select(opciones[opcion]);
    help.style('display', 'none');
  }

  descarga() {
    const h_img = this._headerService.headerimg;
    const f_img = this._headerService.footerimg;
    const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });

    var title = "Línea del tiempo de " + this.varText;
    if (this.estado == 'none ' && this.municipio == 'none') {
      title = title + '- Nacional'
    }
    if (this.estado != 'none ' && this.municipio == 'none') {
      title = title + '- ' + this.name_estado;
    }
    if (this.estado != 'none ' && this.municipio != 'none') {
      title = title + '- ' + this.name_municipio + ', ' + this.name_estado;
    }

    var help = this.help_text;
    d3.select('#c_bloqueo_l').style('display', 'block');
    const cambio = d3.select('#chart > svg');
    cambio.attr('viewBox', null);
    cambio.attr('preserveAspectRatio', null);
    cambio.attr('width', '800');
    cambio.attr('height', '300');
    const svgString = new XMLSerializer().serializeToString(document.querySelector('#chart> svg'));
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
      html2canvas(document.getElementById('c_impresion_l')).then(function(canvas) {

        const img2 = canvas.toDataURL('image/png');

        doc.addImage(h_img, 'JPEG', 5.5, 0);
        doc.addImage(img2, 'JPEG', 4, 100);
        doc.addImage(f_img, 'PNG', 5.5, 255);
        doc.autoPrint();
        doc.save('fichaCompleta.pdf');
        d3.selectAll('#i_help_l >* ').remove();
        d3.selectAll('#i_title_l >* ').remove();
        d3.selectAll('#i_img_l >* ').remove();
        d3.selectAll('#i_legend_l >* ').remove();
        d3.select('#chart > svg')
          .attr('width', null)
          .attr('height', null)
          .attr('viewBox', '0 0 800 300')
          .attr('preserveAspectRatio', 'xMidYMid');

        d3.select('#c_bloqueo_l').style('display', 'none');



      });
    }


  }

  build_dta_csv() {

    let csv_dta = [];
    let objeto = {
      seccion: "mapa",
      mes_inicio: this.i_mes,
      anio_inicio: this.i_year,
      mes_fin: this.f_mes,
      anio_fin: this.f_year,
      variable: "",
      subvariable: 'N/A',
      valor_nacional: this.v_nacioal,
      estado: "N/A",
      v_estatal: "N/A",
      municipio: "N/A",
      v_municipal: "N/A"

    }

    objeto.variable = $("#map_var option:selected").text();
    if (this.variable == "usr") {
      objeto.subvariable = $("#map_sub option:selected").text();
    }
    if (this.estado != 'none') {
      objeto.estado = this.estado;
      objeto.v_estatal = this.v_estatal + "";
    }
    if (this.municipio != 'none') {
      objeto.municipio = this.municipio;
      objeto.v_municipal = this.v_municipal + "";

    }
    csv_dta.push(objeto);
    let data = [csv_dta];
    this._generateService.generate(data, 'mapa_ficha');
  }

  device() {
    //console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //console.log(this.deviceInfo);

  }



}
