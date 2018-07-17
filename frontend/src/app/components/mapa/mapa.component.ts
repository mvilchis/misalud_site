import { Component, OnInit } from '@angular/core';
import { MapaService } from '../../services/mapa.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderService } from '../../services/header.service';
import { DatemapaService } from '../../services/datemapa.service';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import * as $ from 'jquery';
import { GCsvService } from '../../services/g-csv.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html'
})
export class MapaComponent implements OnInit {

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

  datos: any;
  v_estatal = 0;
  v_municipal = 0;
  v_nacioal = 0;
  info: any;
  variable = 'usr';
  estado = 'none';
  municipio = 'none';
  encabezado = 1;
  estados = [];
  municipios = [];
  varText = '';
  dta_map;

  //------ variables de mapa------------
  public chart_width = 800;
  public chart_height = 600;
  public color;
  public projection;
  public path;
  public svg;
  public tooltip;


  deviceInfo = null;

  //------------------------------------
  opcionsub = 'none';
  subvariable = [];

  constructor(
    public _mapaService: MapaService,
    public http: HttpClient,
    public _headerService: HeaderService,
    private router: Router,
    private _dateSer: DatemapaService,
    public _generateService: GCsvService,
    private deviceService: DeviceDetectorService) {
    this._headerService.encabezado = 1;
    this._headerService.active_change('map');

  }

  ngOnInit() {
    //----------------set dates --------------------
    this.device();
    this._dateSer.t_data = 1;
    this.buildYears();
    this.meses_inicio = this.meses;
    this._mapaService.cargaEstados().subscribe((resp: any) => {

      this.estados = resp;
    });

    this.subvariable = this._mapaService.subvariable;

    this.projection = d3.geoMercator()
      .center([-98.6, 22])
      .translate([this.chart_width / 1.85, this.chart_height / 1.85])
      .scale(this.chart_width * 1.674);

    this.path = d3.geoPath(this.projection);

    this.svg = d3.select('#chart')
      .append('svg');
    if (this.deviceInfo.browser == "ie") {
      this.svg.attr("width", this.chart_width)
        .attr("height", this.chart_height);

    }
    else {
      this.svg.attr('viewBox', '0 0 800 600')
        .attr('preserveAspectRatio', 'xMidYMid');
    }



    this.svg.append('g')
      .attr('class', 'legendLinear')
      .attr('transform', 'translate(20,20)');


    this.tooltip = d3.select('#chart').append('div')
      .attr('id', 'tool')
      .attr('class', 'tooltipMapa');

    this._mapaService.cargarMapa().subscribe((mx_mapa: any) => {



      this.svg.selectAll('path')
        .data(mx_mapa.features)
        .enter()
        .append('path')
        .attr('d', this.path)
        .attr('fill', '#ccc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      this._mapaService.getAllUsers(this.i_date, this.f_date).subscribe(resp => {

        this.info = resp[1];
        this.mapa(resp[1]);
        this.opcionsub = 'users';
      });
    }
    );


    this._mapaService.get_nacional(this.i_date, this.f_date).subscribe(resp => {
      this.v_nacioal = resp;
    });

    this.chageVarName();


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

    if (this.variable == 'bby') {
      this.changeVar();
    } else {
      this.varChange();
    }


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








  changeVar() {



    switch (this.variable) {
      case 'usr':
        this.opcionsub = 'users';
        this.municipio = 'none';
        this._mapaService.getAllUsers(this.i_date, this.f_date).subscribe(resp => {
          //this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
        });

        this._mapaService.get_nacional(this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        this.chageVarName();

        break;

      case 'bby':
        this.opcionsub = 'bbyState';
        this.municipio = 'none';
        this._mapaService.getBbyState(this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
        });

        break;
    }

  }






  //------------funcion change select subvariable
  varChange() {
    this.chageVarName();


    switch (this.opcionsub) {
      //todos los usuarios
      case 'users':
        this._mapaService.getAllUsers(this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';

        });
        this._mapaService.get_nacional(this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });

        break;

      case 'tPregnal':
        this._mapaService.getPregnals(this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allType('pregnant').subscribe(resp => {
          this.v_nacioal = resp;
        });



        break;

      case 'tMomBby':
        this._mapaService.getMomBby(this.i_date, this.f_date).subscribe(resp => {
          //this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allType('baby').subscribe(resp => {
          this.v_nacioal = resp;
        });

        break;
      case 'tPrestador':
        this._mapaService.getPrestador(this.i_date, this.f_date).subscribe(resp => {
          //this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allType('personal').subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'm18':
        this._mapaService.getMom(0, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });

        this._mapaService.get_allMage(0, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'm35':
        this._mapaService.getMom(1, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allMage(1, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'mMas':
        this._mapaService.getMom(2, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allMage(2, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;

      case 'hImss':
        this._mapaService.getHospital(0, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(0, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hIsste':
        this._mapaService.getHospital(1, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(1, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hSP':
        this._mapaService.getHospital(2, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(2, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hInst':
        this._mapaService.getHospital(3, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(3, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hPemex':
        this._mapaService.getHospital(4, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          console.log('pemex');
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(4, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hSedena':
        this._mapaService.getHospital(5, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(5, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hFarm':
        this._mapaService.getHospital(6, this.i_date, this.f_date).subscribe(resp => {
          //    this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(6, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hPrivado':
        this._mapaService.getHospital(7, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(7, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'hOtro':
        this._mapaService.getHospital(8, this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allAtencion(8, this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'mSMS':
        this._mapaService.getMedio('sms', this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allChannel('sms', this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'mFB':
        this._mapaService.getMedio('facebook', this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          this.municipio = 'none';
        });
        this._mapaService.get_allChannel('facebook', this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;
      case 'mTW':
        this._mapaService.getMedio('twitter', this.i_date, this.f_date).subscribe(resp => {
          //  this.v_nacioal=resp[0];
          this.info = resp[1];
          this.mapa(resp[1]);
          if (this.estado != 'none') {
            this.valorEstatal();
          }
          //this.estado="none";
          this.municipio = 'none';
        });
        this._mapaService.get_allChannel('twitter', this.i_date, this.f_date).subscribe(resp => {
          this.v_nacioal = resp;
        });
        break;

    }



  }

  valorEstatal() {

    const est = parseInt(this.estado);

    this.v_estatal = 0;
    for (const busqueda of this.info) {
      const bus = parseInt(busqueda.cve_ent);

      if (bus == est) {
        this.v_estatal = busqueda.count;

      }
    }

    this.mapa(this.info);

    // carga de munucipios
    this.municipio = 'none';

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

    for (const mun of this.municipios) {
      if (this.municipio == mun.cve_comb) {
        this.v_municipal = mun.count;
      }
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



  mapa(datos) {

    var state = this.estado;

    var tool = d3.select("#tool");

    var color_legend = ["rgb(46, 73, 123)", "rgb(71, 187, 94)"];


    var color = d3.scaleQuantize().range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    var valores = [];


    for (const valor of datos) {
      valores.push(valor.count);
    }

    color.domain([
      d3.min(valores),
      d3.max(valores)

    ]);

    d3.selectAll('#parent_gradient > *').remove();
    let gradient = d3.select('#parent_gradient').append('div').attr('class', 'mapa_gradient');
    let key = d3.select('#parent_gradient')
      .append('svg')
      .attr('width', 300)
      .attr('height', 50);



    /*let legend = key.append('defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient');

    legend.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ccc')
      .attr('stop-opacity', 1);

    legend.append('stop')
      .attr('offset', '10%')
      .attr('stop-color', '#9bfde6')
      .attr('stop-opacity', 1);

    legend.append('stop')
      .attr('offset', '40%')
      .attr('stop-color', '#46e2bc')
      .attr('stop-opacity', 1);

    legend.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#00a68a')
      .attr('stop-opacity', 1);

    legend.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00576c')
      .attr('stop-opacity', 1);

    key.append('rect')
    .classed('mapa_gradient',true)
      .attr('width', 250)
      .attr('height', 20);*/

    let y = d3.scaleLinear()
      .range([250, 0])
      .domain([
        d3.max(valores),

        0

      ]);

    let yAxis = d3.axisBottom(y)
      .scale(y)
      .ticks(6);

    key.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(2,1)')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 1)
      .attr('dy', '.81em')
      .style('text-anchor', 'end')
      .text('axis title');


    this._mapaService.cargarMapa().subscribe((mx_mapa: any) => {
      mx_mapa.features.forEach(function(mx_e, mx_i) {
        datos.forEach(function(d_e, d_i) {


          if (mx_e.properties.cve_ent != d_e.cve_ent) {
            return null;

          }
          mx_mapa.features[mx_i].properties.count = parseFloat(d_e.count);


        });
      });


      this.svg.selectAll('path')
        .data(mx_mapa.features)
        .on('mousemove', mouseEntra)
        .on('mouseout', mousesale)
        .transition()
        .duration(1000)
        .attr('id', g_id)
        .attr('fill', colorAuto)
        .attr('stroke', '#fff');


      this.dta_map = mx_mapa.features;

    });



    function g_id(d) {
      return d.properties.cve_ent;
    }

    function mouseEntra(d) {

      var screen = d3.select('body').style('width');
      console.log(screen);
      screen = screen.replace('px', '');
      var left;
      var top;

      if (parseInt(screen) > 980) {
        left = d3.mouse(this)[0] - 15 + 'px';
        top = d3.mouse(this)[1] - 10 + 'px';
      }
      else {
        left = '40%';
        top = '2%';
      }



      let cuenta = 0;
      if (d.properties.count >= 0) {
        cuenta = d.properties.count;
      }

      let texto = d.properties.name + ':\n' + cuenta;


      tool.style('left', left)
        .style('top', top)
        .style('display', 'inline-block')
        .html(texto);

    }
    function mousesale() {
      tool.style('display', 'none');
    }


    function colorAuto(d) {

      var colores = ['#9bfde6',
        '#90f9e1',
        '#85f6db',
        '#7bf3d6',
        '#70efd1',
        '#66eccc',
        '#5be9c6',
        '#51e6c1',
        '#46e2bc',
        '#3cdfb7',
        '#31dcb2',
        '#27d8ac',
        '#1cd5a7',
        '#12d2a2',
        '#07ce9d',
        '#00ca98',
        '#00c295',
        '#00bb93',
        '#00b490',
        '#00ad8d',
        '#00a68a',
        '#009f88',
        '#009885',
        '#009182',
        '#00897f',
        '#00827c',
        '#007b7a',
        '#007477',
        '#006d74',
        '#006672',
        '#005f6f',
        '#00576c'

      ];

      if (state != d.properties.cve_ent) {
        if (d.properties.count > 0) {
          const value = color(d.properties.count);

          return colores[value];
        } else {
          return '#ccc';
        }

      } else {
        return '#139ffe';
      }



    }




  }

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

  ver_ficha() {


    this._dateSer.i_year = this.i_year;
    this._dateSer.i_mes = this.i_mes;
    this._dateSer.f_year = this.f_year;
    this._dateSer.f_mes = this.f_mes;
    this._dateSer.estado = this.estado;
    this._dateSer.opcionsub = this.opcionsub;
    this._dateSer.municipio = this.municipio;
    this._dateSer.variable = this.variable;


    this.router.navigate(['/info']);


  }

  generate_csv() {

    let csv_dta = [];
    for (let dta of this.dta_map) {
      let objeto;
      if (this.municipio == 'none') {
        objeto = {
          seccion: "mapa",
          mes_inicio: this.i_mes,
          anio_inicio: this.i_year,
          mes_fin: this.f_mes,
          anio_fin: this.f_year,
          variable: "",
          subvariable: 'N/A',
          valor_nacional: this.v_nacioal,
          estado: "",
          v_estatal: 0
        }
      }
      else {
        objeto = {
          seccion: "mapa",
          mes_inicio: this.i_mes,
          anio_inicio: this.i_year,
          mes_fin: this.f_mes,
          anio_fin: this.f_year,
          variable: "",
          subvariable: 'N/A',
          valor_nacional: this.v_nacioal,
          estado: "",
          v_estatal: 0,
          municipio: "N/A",
          v_municipal: "N/A"

        }

      }
      objeto.estado = dta.properties.name;
      if (dta.properties.count > 0) {
        objeto.v_estatal = dta.properties.count;
      }
      csv_dta.push(objeto);

    }

    if (this.municipio != 'none') {
      let mun = {
        seccion: "mapa",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "",
        subvariable: 'N/A',
        valor_nacional: this.v_nacioal,
        estado: "",
        v_estatal: this.v_estatal,
        municipio: "",
        v_municipal: this.v_municipal

      }
      mun.estado = $("#state_var option:selected").text();
      mun.municipio = $("#mun_var option:selected").text();
      csv_dta.push(mun);
    }

    for (let dta of csv_dta) {
      dta.variable = $("#map_var option:selected").text();
      if (this.variable == "usr") {
        dta.subvariable = $("#map_sub option:selected").text();
      }

    }

    let data = [csv_dta];
    this._generateService.generate(data, 'mapa');
  }

  device() {
    //console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //console.log(this.deviceInfo);

  }


}
