import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class UsuariosService {

  lbl_bar_usr = [];

  public url = 'http://rapidpro.datos.gob.mx';
  constructor(public http: HttpClient) { }


  get_momAge(start, end): Observable<any> {

    let query = this.url + `/unicef/users_by_mom_age`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const dta = [];
    const result = [];
    let conteo = 0;
    return this.http.get(query).map((resp: any) => {

      for (const data of resp.response) {
        const objeto = {
          name: '',
          value: 0
        };

        objeto.name = data.group.replace(/.0/g, ' ');
        objeto.name = objeto.name.replace('35 -*', '35 o más');
        objeto.name = objeto.name + " años";
        objeto.value = data.count;
        conteo = conteo + parseInt(data.count);

        dta.push(objeto);
      }
      result[0] = conteo;
      result[1] = dta;

      return result;

    });

  }
  get_tAten(start, end): Observable<any> {

    let query = this.url + `/unicef/users_by_hospital`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    const result = [];
    let conteo = 0;
    return this.http.get(query).map((resp: any) => {

      for (const data of resp.response) {

        const objeto = {
          name: '',
          value: 0
        };
        if (data.key != 'Other') {
          objeto.name = data.key.replace('SP', 'Seguro Popular');
          objeto.value = data.count;
          conteo = conteo + parseInt(data.count);

          dta.push(objeto);
        }
      }
      result[0] = conteo;
      result[1] = dta;

      return result;
    });

  }

  get_bbyAge(start, end): Observable<any> {
    const trimestres = ['recién nacido', '0 a 3 meses', '4 a 6 meses', '7 a 9 meses', '10 a 12 meses', '13 a 15 meses', '16 a 18 meses', '19 a 21 meses', '2 años'];
    let query = this.url + `/unicef/users_by_baby_age`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const dta = [];
    const result = [];
    let conteo = 0;
    return this.http.get(query).map((resp: any) => {

      for (const data of resp.response) {

        const objeto = {
          name: '',
          value: 0
        };
        objeto.name = trimestres[data.trimester];
        objeto.value = data.count;
        conteo = conteo + parseInt(data.count);

        dta.push(objeto);
      }
      result[0] = conteo;
      result[1] = dta;

      return result;

    });

  }
  get_bbyMage(start, end): Observable<any> {

    let query = this.url + `/unicef/babies_by_mom_age`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    const result = [];
    let conteo = 0;
    return this.http.get(query).map((resp: any) => {

      for (const data of resp.response) {

        const objeto = {
          name: '',
          value: 0
        };

        objeto.name = data.group.replace(/.0/g, ' ');
        objeto.name = objeto.name.replace('35 -*', '35 o más');
        objeto.name = objeto.name + " años";
        objeto.value = data.count;

        conteo = conteo + parseInt(data.count);

        dta.push(objeto);
      }
      result[0] = conteo;
      result[1] = dta;

      return result;

    });

  }

  get_semanaGestacion(start, end): Observable<any> {

    let query = this.url + `/unicef/babies_by_week`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    const lbl = [];
    let total = 0;
    const result = [];
    return this.http.get(query).map((resp: any) => {

      for (const dato of resp.response) {
        const objeto = {
          year: '',
          value: 0
        };
        objeto.year = dato.group;
        objeto.value = dato.count;
        total = total + dato.count;
        dta.push(objeto);


      }
      result[0] = total;
      result[1] = dta;
      return result;

    });



  }

  get_userByType(start, end): Observable<any> {

    let query = this.url + `/unicef/users_by_type`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    let total = 0;
    const respuesta = [];
    return this.http.get(query).map((resp: any) => {

      const resultado = resp.response;
      for (const dato of resultado) {
        dato.group = dato.group.replace('pregnant', 'Embarazadas');
        dato.group = dato.group.replace('baby', 'Mamás');
        dato.group = dato.group.replace('personal', 'Personal Salud');
        total = total + parseInt(dato.count);
      }

      const l = resultado.length;
      for (let i = 0; i < l; i++) {
        for (let j = 0; j < l - 1 - i; j++) {
          if (resultado[j].count < resultado[j + 1].count) {
            [resultado[j], resultado[j + 1]] = [resultado[j + 1], resultado[j]];
          }
        }
      }




      respuesta[0] = total;
      respuesta[1] = resultado;
      return respuesta;

    });


  }

  get_bbyAtencion(start, end): Observable<any> {

    let query = this.url + `/unicef/babies_by_hospital`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      const dta = [];
      const result = [];
      let total = 0;

      for (const value of resp.response) {

        total = total + value.count;
      }


      for (const dato of resp.response) {
        const objeto = {
          key: '',
          count: 0,
          porciento: ''
        };
        if (dato.key != 'Other') {
          objeto.key = dato.key.replace('SP', 'Seguro Popular');
          objeto.count = dato.count;
          objeto.porciento = ((dato.count / total) * 100) + '%';
          dta.push(objeto);
        }
      }
      result[0] = total;
      result[1] = dta;
      return result;
    });

  }

  get_usrByChannel(start, end): Observable<any> {

    let query = this.url + `/unicef/users_by_channel`;
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
        if (dato.key != 'others') {

          objeto.size = dato.count;

          if (dato.key == "sms") {
            objeto.name = dato.key.toUpperCase();
            legend.group = dato.key.toUpperCase();
          }
          else {
            objeto.name = dato.key.charAt(0).toUpperCase() + dato.key.slice(1);
            legend.group = dato.key.charAt(0).toUpperCase() + dato.key.slice(1);
          }

          legend.count = dato.count;
          total = total + parseInt(dato.count);
          values.push(objeto);
          lbl.push(legend);
        }

      }

      dta.children = values;

      lbl.sort(function(a, b) {
        if (a.count < b.count) {
          return 1;
        }
        if (a.count > b.count) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      for (let datos of dta.children) {
        var porcentaje = (datos.size * 100) / total;

        if (porcentaje > 3) {
          datos.name_box = datos.name;
        }

      }



      result[0] = lbl; // generacion de leyendas
      result[1] = dta; // generacion para grafica
      result[2] = total; // conteo toatl de usuarios

      return result;
    });





  }


  get_bbyByChannel(start, end): Observable<any> {

    let query = this.url + `/unicef/babies_by_channel`;
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
        if (dato.key != 'others') {
          objeto.size = dato.count;
          if (dato.key == "sms") {
            objeto.name = dato.key.toUpperCase();
            legend.group = dato.key.toUpperCase();
          }
          else {
            objeto.name = dato.key.charAt(0).toUpperCase() + dato.key.slice(1);
            legend.group = dato.key.charAt(0).toUpperCase() + dato.key.slice(1);
          }

          legend.count = dato.count;
          total = total + parseInt(dato.count);
          values.push(objeto);
          lbl.push(legend);

        }



      }

      dta.children = values;
      lbl.sort(function(a, b) {
        if (a.count < b.count) {
          return 1;
        }
        if (a.count > b.count) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      for (let datos of dta.children) {
        var porcentaje = (datos.size * 100) / total;

        if (porcentaje > 3) {
          datos.name_box = datos.name;
        }

      }
      result[0] = lbl; // generacion de leyendas
      result[1] = dta; // generacion para grafica
      result[2] = total; // conteo toatl de usuarios

      return result;
    });





  }













}
