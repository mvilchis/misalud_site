import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class MensajesService {
  public url = 'http://rapidpro.datos.gob.mx';

  helps_rate = [
    {
      'opcion': 'momAge',
      'texto': 'Tasa de respuesta (porcentaje de mensajes finalizados por la usuaria del total de mensajes de doble vía recibidos) por edad.'
    },
    {
      'opcion': 'afil',
      'texto': 'Tasa de respuesta (porcentaje de mensajes finalizados por la usuaria del total de mensajes de doble vía recibidos) por lugar donde reportan recibir atención médica.'
    }, {
      'opcion': 'medio',
      'texto': 'Tasa de respuesta (porcentaje de mensajes finalizados por la usuaria del total de mensajes de doble vía recibidos) por medio.'
    },
  ];


  constructor(public http: HttpClient) { }

  get_MsjTop(start, end): Observable<any> {

    let query = this.url + `/unicef/rate_by_message`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const dt = new Date();
    const fecha = dt.getDate() + '.' + (dt.getMonth() - 1) + '.' + dt.getFullYear();

    return this.http.get(query).map((resp: any) => {
      const mensajes = [];

      for (const msj of resp.response) {
        const objeto = {
          'msj': '',
          'type': ''
        };
        objeto.msj = msj.message.replace('@contact.rp_name', 'María');
        objeto.msj = objeto.msj.replace('@(DATEVALUE(contact.rp_deliverydate))', fecha);
        objeto.msj = objeto.msj.replace('@contact.rp_babyname', 'Tu bebé');
        objeto.type = msj.type;
        mensajes.push(objeto);

      }
      return mensajes;


    });


  }
  get_rateMage(start, end): Observable<any> {
    let query = this.url + `/unicef/rate_by_mom_age`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    let total = 0;
    const respuesta = [];
    return this.http.get(query).map((resp: any) => {
      for (const datos of resp.response) {
        const objeto = {
          name: '',
          value: 0
        };
        objeto.name = datos.age.replace(/.0/g, ' ');
        objeto.name = objeto.name.replace('35 -*', '35 o más');
        objeto.name = objeto.name + " años";
        objeto.value = datos.rate;
        total = total + Math.round(datos.rate);
        dta.push(objeto);
      }

      respuesta[0] = total;
      respuesta[1] = dta;
      return respuesta;

    });
  }
  get_rateAtencion(start, end): Observable<any> {
    let query = this.url + `/unicef/rate_by_hospital`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const dta = [];
    let total = 0;
    const respuesta = [];
    return this.http.get(query).map((resp: any) => {
      for (const datos of resp.response) {
        const objeto = {
          name: '',
          value: 0
        };
        if (datos.hospital != 'Other') {
          objeto.name = datos.hospital.replace('SP', 'Seguro Popular');
          objeto.value = datos.rate;
          total = total + Math.round(datos.rate);
          dta.push(objeto);


        }
      }

      respuesta[0] = total;
      respuesta[1] = dta;
      return respuesta;

    });
  }
  get_rateMedio(start, end): Observable<any> {
    let query = this.url + `/unicef/rate_by_channel`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    let total = 0;
    const respuesta = [];
    return this.http.get(query).map((resp: any) => {

      const facebook = {
        name: 'Facebook',
        value: resp.response.facebook
      };
      const tel = {
        name: 'Tel',
        value: resp.response.tel
      };
      const twitter = {
        name: 'Twitter',
        value: resp.response.twitter
      };
      dta.push(facebook);
      dta.push(tel);
      dta.push(twitter);

      for (const count of dta) {
        total = total + Math.round(count.value);
      }


      respuesta[0] = total;
      respuesta[1] = dta;
      return respuesta;

    });
  }

  get_msjTopic(start, end): Observable<any> {

    let query = this.url + '/unicef/msgs_by_topic';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    const values = [];

    return this.http.get(query).map((resp: any) => {

      for (const dato of resp.response) {
        const objeto = {
          'name': '',
          'name_box': '',
          'size': 0
        };
        const legend = {
          'group': '',
          'count': 0,
        };

        objeto.name = dato.categoria.charAt(0).toUpperCase() + dato.categoria.slice(1);
        objeto.size = dato.count;
        legend.group = dato.categoria.charAt(0).toUpperCase() + dato.categoria.slice(1);
        legend.count = dato.count;
        total = total + dato.count;
        values.push(objeto);
        lbl.push(legend);

      }


      dta.children = values;

      for (let datos of dta.children) {
        var porcentaje = (datos.size * 100) / total;

        if (porcentaje > 4) {
          datos.name_box = datos.name;
        }

      }
      result[0] = lbl;
      result[1] = dta;
      result[2] = total;

      return result;
    });


  }







}
