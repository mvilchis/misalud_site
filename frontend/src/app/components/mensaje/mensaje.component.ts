import { Component, OnInit } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
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
  selector: 'app-mensaje',
  templateUrl: './mensaje.component.html',
  providers: [DecimalPipe, fmilesPipe]
})
export class MensajeComponent implements OnInit {
  deviceInfo = null;
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

  mesajes = [];
  barras = 'momAge';
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  width = 400 - this.margin.left - this.margin.right;
  height = 300 - this.margin.top - this.margin.bottom;

  width2 = 400;
  height2 = 300;

  total_rate = 0;
  total_msj = 0;
  chart_rate = true;
  chart_topic = true;
  chart_msj = true;
  help_rate = 'Tasa de respuesta (porcentaje de mensajes finalizados por la usuaria del total de mensajes de doble vía recibidos) por edad.';
  helps_option;

  public svg;
  public svg_expand; //bar expand
  public tooltipTopic;
  public svgTopic;
  public svgTopic_expand; //treeMap expand
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

  public dta_bar;
  public dta_tree;
  public dta_msj;

  constructor(
    public _msjService: MensajesService,
    public _headerService: HeaderService,
    public _generateService: GCsvService,
    private deviceService: DeviceDetectorService,
    private decimalPipe: DecimalPipe,
    private fmiles_pipe: fmilesPipe) {
    this._headerService.encabezado = 0;
    this._headerService.active_change('msj');
  }

  ngOnInit() {

    this.buildYears();
    this.meses_inicio = this.meses;
    this.helps_option = this._msjService.helps_rate;


    //------------build mensajes
    this._msjService.get_MsjTop(this.i_date, this.f_date).subscribe(resp => {
      this.mesajes = resp;
      this.build_dta_msj(resp);
    });
    //-------------------


    this._msjService.get_rateMage(this.i_date, this.f_date).subscribe(resp => {
      if (resp[0] > 0) {
        this.chart_rate = true;


        this.bar_tasa(resp[1], true, '#chart', 'general', 'tool_bar');
        this.legends_bar(resp[1], '#lgnd_bar');
        this.total_rate = resp[0];

        this.bar_tasa(resp[1], true, '#chart_expand', 'general_expand', 'tool_bar_expand');
        this.legends_bar(resp[1], '#lgnd_bar_expand');
      } else {
        this.chart_rate = false;
        this.total_rate = resp[0];
        d3.selectAll('#lgnd_bar > *').remove();
        d3.selectAll('#chart >*').remove();

      }

    });


    ///-------------------------------------------------------------

    //buil treemap _usrByChannel




    this._msjService.get_msjTopic(this.i_date, this.f_date).subscribe(resp => {

      if (resp[2] > 0) {
        this.chart_topic = true;
        this.treeMap(resp[1], '#chartTopic', 'topoc_tool');
        this.legends(resp[0], '#lgnTopic');
        this.total_msj = resp[2];
        this.treeMap(resp[1], '#chartTopic_expand', 'topic_tool_expand');
        this.legends(resp[0], '#lgnTopic_expand');
      } else {
        this.chart_topic = false;
        this.total_msj = resp[2];
        d3.selectAll('#lgnTopic >*').remove();
        d3.selectAll('#chartTopic >*').remove();
      }
    });

    //----------------set dates --------------------




  }

  varChange() {

    switch (this.barras) {
      case 'momAge':
        this._msjService.get_rateMage(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_rate = true;

            this.bar_tasa(resp[1], true, '#chart', 'general', 'tool_bar');
            d3.selectAll('#lgnd_bar> *').remove();
            this.legends_bar(resp[1], '#lgnd_bar');
            this.total_rate = resp[0];


            this.bar_tasa(resp[1], true, '#chart_expand', 'general_expand', 'tool_bar_expand');
            d3.selectAll('#lgnd_bar_expand> *').remove();
            this.legends_bar(resp[1], '#lgnd_bar_expand');
          } else {
            this.chart_rate = false;
            this.total_rate = resp[0];
            d3.selectAll('#lgnd_bar > *').remove();
            d3.selectAll('#chart >*').remove();

          }
        });

        break;

      case 'afil':
        this._msjService.get_rateAtencion(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_rate = true;

            this.bar_tasa(resp[1], false, '#chart', 'general', 'tool_bar');
            d3.selectAll('#lgnd_bar> *').remove();
            this.legends_bar(resp[1], '#lgnd_bar');
            this.total_rate = resp[0];

            this.bar_tasa(resp[1], false, '#chart_expand', 'general_expand', 'tool_bar_expand');
            d3.selectAll('#lgnd_bar_expand> *').remove();
            this.legends_bar(resp[1], '#lgnd_bar_expand');
          } else {
            this.chart_rate = false;
            this.total_rate = resp[0];
            d3.selectAll('#lgnd_bar > *').remove();
            d3.selectAll('#chart >*').remove();

          }
        });

        break;


      case 'medio':
        this._msjService.get_rateMedio(this.i_date, this.f_date).subscribe(resp => {
          if (resp[0] > 0) {
            this.chart_rate = true;


            this.bar_tasa(resp[1], true, '#chart', 'general', 'tool_bar');
            d3.selectAll('#lgnd_bar> *').remove();
            this.legends_bar(resp[1], '#lgnd_bar');
            this.total_rate = resp[0];


            this.bar_tasa(resp[1], true, '#chart_expand', 'general_expand', 'tool_bar_expand');
            d3.selectAll('#lgnd_bar_expand> *').remove();
            this.legends_bar(resp[1], '#lgnd_bar_expand');
          } else {
            this.chart_rate = false;
            this.total_rate = resp[0];
            d3.selectAll('#lgnd_bar > *').remove();
            d3.selectAll('#chart >*').remove();

          }

        });

        break;
    }


  }

  //bild years 2016 to now year
  buildYears() {
    const now = new Date();
    const nowYear = now.getFullYear();
    const mes = now.getMonth() + 1;
    const meses_f = [];


    this.f_date = `${nowYear}-${mes}-28T00:00:00`;
    this.f_mes = mes + '';
    this.f_year = nowYear + '';



    const years = [];
    for (let y = 2016; y <= nowYear; y++) {
      years.push(y);
    }
    for (let m = 0; m < mes; m++) {
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


    /*resp[0]=inicio;
    resp[1]=fin;
  console.log(resp);*/
    this.i_date = inicio;
    this.f_date = fin;

    this.varChange();
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

    }

    this.changeDate();
  }

  changeStaticChart() {
    this._msjService.get_MsjTop(this.i_date, this.f_date).subscribe(resp => {

      if (resp.length > 0) {
        this.chart_msj = true;
        this.mesajes = resp;

        this.build_dta_msj(resp);

      } else {
        this.chart_msj = false;

      }



    });

    this._msjService.get_msjTopic(this.i_date, this.f_date).subscribe(resp => {

      if (resp[2] > 0) {

        this.chart_topic = true;
        d3.selectAll('#chartTopic > svg  > *').remove();

        d3.selectAll('#lgnTopic > *').remove();

        this.total_msj = resp[2];
        this.treeMap(resp[1], '#chartTopic', 'topoc_tool');
        this.legends(resp[0], '#lgnTopic');


        d3.selectAll('#lgnTopic_expand > *').remove();
        this.treeMap(resp[1], '#chartTopic_expand', 'topic_tool_expand');
        this.legends(resp[0], '#lgnTopic_expand');
      } else {
        this.chart_topic = false;
        this.total_msj = resp[2];
        d3.selectAll('#lgnTopic >*').remove();
        d3.selectAll('#chartTopic >*').remove();
      }





    });

  }


  cleanData(data) {
    d3.selectAll('#chart> svg > g > *').remove();

  }


  bar_tasa(data, xAxi: boolean, grafico, gtext, tool_tip) {
    this.help_build(0);
    let csv_dta = [];
    for (let dato of data) {
      let objeto = {
        seccion: "mensajes",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "Tasa de respuesta ",
        subvariable: '',
        campo: '',
        total: ''

      }
      if (this.barras == "momAge") {
        objeto.subvariable = "Edad mamá";
      }
      else if (this.barras == "afil") {
        objeto.subvariable = "Afiliación médica de la mamá";
      }
      else {
        objeto.subvariable = "Medio";
      }

      objeto.campo = dato.name;
      objeto.total = Math.round(dato.value) + "%";
      csv_dta.push(objeto);
    }
    this.dta_bar = csv_dta;

    d3.selectAll(grafico + '> *').remove();
    const grafica = d3.select(grafico).append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid')
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
      const redondeo = Math.round(dato.value);
      values.push(redondeo);
    }



    const altura = this.height;
    const x_scale = d3.scaleBand()
      .range([0, this.width]);

    const y_scale = d3.scaleLinear()
      .range([this.height, 0]);

    const xAxis = d3.axisBottom(x_scale);



    x_scale.domain(data.map(function(d) { return d.name; }))
      .paddingInner(0.4)
      .paddingOuter(0.5);
    y_scale.domain([0, d3.max(values)]);
    const yAxis = d3.axisLeft(y_scale);

    if (xAxi == true) {
      grafica.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(xAxis);

    } else {
      grafica.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .append('rect')
        .attr('width', this.width * .95)
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



    function texto(d) {

      return Math.round(d.value) + "%";

    }
    function showTooltip(d) {


      const left = d3.mouse(this)[0] - 30 + 'px';
      const top = d3.mouse(this)[1] - 30 + 'px';

      tool.style('left', '43%')
        .style('top', '75%')
        .style('display', 'inline-block')
        .html(d.name);
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }






    function x_escla(d) {


      return x_scale(d.name);
    }

    function x_esclat(d) {


      return x_scale(d.name) + x_scale.bandwidth() / 2;
    }

  }

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
      })
      ;
  }

  //-------
  legends_bar(data, lgnd: string) {

    const colores = this.RangoColores;

    const valores = [];

    for (const dta of data) {
      let value = Math.round(dta.value);
      valores.push(this.fmiles_pipe.transform(value));
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
        return d.name + ': ' + Math.round(d.value) + "%";
      });
  }

  //treemap
  treeMap(data, grafico, tool_topic) {

    this.help_build(1);
    let csv_dta = [];
    for (let dato of data.children) {
      let objeto = {
        seccion: "mensajes",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "Total de mensajes enviados por categoría ",
        subvariable: 'N/A',
        campo: '',
        total: 0

      }
      objeto.campo = dato.name;
      objeto.total = dato.size;
      csv_dta.push(objeto);

    }
    this.dta_tree = csv_dta;
    let numberPipe = this.decimalPipe;


    d3.selectAll(grafico + '>*').remove();
    const grafica = d3.select(grafico)
      .append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid');

    d3.select(grafico).append('div')
      .attr('id', tool_topic)
      .attr('class', 'tooltipMapa');

    const colores = this.RangoColores;

    const tool = d3.select('#' + tool_topic);

    const valores = [];
    for (const valor of data.children) {
      valores.push(valor.size);
    }

    const treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([this.width2, this.height2])
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
      .transition()
      .duration(1500)
      .attr('id', function(d) { return d.data.id; })
      .attr('width', function(d: any) { return d.x1 - d.x0; })
      .attr('height', function(d: any) { return d.y1 - d.y0; })
      .attr('stroke', 'white')
      .attr('stroke-width', 0.7)
      .attr('fill', function(d, i) {
        return colores[i];
      });

    cell.append('text')

      .selectAll('tspan')
      .data(function(d) { return d.data.name_box.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append('tspan')
      .attr('x', 8)
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

      tool.style('left', '30%')
        .style('top', '70%')
        .style('display', 'inline-block')
        .html(d.data.name + ':\n' + numberPipe.transform(d.data.size));
    }

    function hideTooltip() {
      tool.style('display', 'none');
    }

  }

  help_enter(opcion) {
    const opciones = ['#help_rate', '#help_topic', '#help_msj'];
    const help = d3.select(opciones[opcion]);
    help.style('display', 'inline');

  }

  help_build(opcion) {
    const opciones = ['#help_rate', '#help_topic', '#help_msj'];
    if (opcion == 0) {
      for (const op of this.helps_option) {
        if (op.opcion == this.barras) {
          this.help_rate = op.texto;
        }

      }
    }

  }
  help_out(opcion) {
    const opciones = ['#help_rate', '#help_topic', '#help_msj'];
    const help = d3.select(opciones[opcion]);
    help.style('display', 'none');
  }
  descarga_chart(grafica, leyenda, name) {
    let title = '';
    let legend = '';
    let help = '';
    const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });
    let lgn = d3.select(leyenda).html();

    if (grafica == "#chart") {
      title = "Tasa de respuesta";
      help = this.help_rate;

    }
    if (grafica == "#chartTopic") {
      title = "Total de mensajes enviados por categoría";
      help = "Total de mensajes enviados a las usuarias por tipo de mensaje."

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
  descarga_top_msj() {

    const h_img = this._headerService.headerimg;
    const f_img = this._headerService.footerimg;
    var title = "Top 10 mensajes más populares",
      help = "Mensajes enviados con mayor tasa de respuesta por parte de las usuarias"
    let lgn = d3.select('#top_mensajes').html();
    d3.select('#c_bloqueo_l').style('display', 'block');
    d3.select("#i_title_l").append('p').attr('class', 'title_impresion').text(title);
    d3.select("#i_help_l").append('p').attr('class', 'help_impresion').text(help);
    d3.select("#i_legend_l").append('div').html(lgn);

    html2canvas(document.getElementById('c_impresion_l'), { scale: 1 }).then(function(canvas) {
      const img2 = canvas.toDataURL('image/png');
      const doc: any = new jsPDF({ orientation: 'p', unit: 'mm', fotmat: 'letter' });
      doc.addImage(h_img, 'JPEG', 5.5, 0);
      doc.addImage(img2, 'JPEG', 10, 50, 190, 190);
      doc.addImage(f_img, 'PNG', 5.5, 255);
      doc.autoPrint();
      doc.save('topMensajes.pdf');
      d3.selectAll('#i_help_l >* ').remove();
      d3.selectAll('#i_title_l >* ').remove();
      d3.selectAll('#i_img_l >* ').remove();
      d3.selectAll('#i_legend_l >* ').remove();


      d3.select('#c_bloqueo_l').style('display', 'none');



    });



  }

  generate_csv() {
    let dta = [this.dta_bar, this.dta_tree, this.dta_msj];
    this._generateService.generate(dta, 'mensajes');
  }

  build_dta_msj(data) {
    let csv_dta = [];
    for (let dato of data) {
      let objeto = {
        seccion: "mensajes",
        mes_inicio: this.i_mes,
        anio_inicio: this.i_year,
        mes_fin: this.f_mes,
        anio_fin: this.f_year,
        variable: "Top 10 mensajes más populares",
        subvariable: 'N/A',
        campo: '',
        total: 'N/A'

      }
      objeto.campo = dato.msj;
      csv_dta.push(objeto);
    }
    this.dta_msj = csv_dta;

  }
  device() {
    //console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //console.log(this.deviceInfo);

  }


}
