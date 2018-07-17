import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { MapainfoService } from './mapainfo.service';

@Injectable()
export class MapainfoChartService {
  public url = 'http://rapidpro.datos.gob.mx';

  //   private regresoFuente = new BehaviorSubject<any>([]);
  // public regreso$ = this.regresoFuente.asObservable();
  private regresar$ = new Subject<any>();


  constructor(public http: HttpClient, public _mapinfo: MapainfoService) { }




  years_allusers(i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];


    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);


    function get_data(fechas, state) {
      let conteo = 0;
      let query = '';
      if (state == 'none') {
        query = url + '/unicef/users_by_channel' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/users_by_state' + fechas;
      }
      return http.get(query).map((resp: any) => {

        if (state == 'none') {
          for (const dato of resp.response) {
            conteo = conteo + parseInt(dato.count);
          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {
            if (dato.key == state) {
              conteo = dato.count;
            }

          }

        }
        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state) {
      for (const item of fechas) {
        get_data(item.query, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado);
    return regreso.asObservable();
  }

  years_BbyState(i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];


    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;

    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    function get_data(fechas, state) {
      let conteo = 0;


      const query = url + '/unicef/babies_by_state' + fechas;

      return http.get(query).map((resp: any) => {

        if (state == 'none') {
          for (const dato of resp.response) {
            conteo = conteo + dato.count;
          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {

            if (dato.key == state) {
              conteo = dato.count;
            }

          }


        }
        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state) {
      for (const item of fechas) {
        get_data(item.query, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado);
    return regreso.asObservable();
  }

  years_getPrestador(i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;



    function get_data(fechas, state) {
      let conteo = 0;
      let query = ""
      if (state == 'none') {
        query = url + '/unicef/users_by_type' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/personal_by_state' + fechas;
      }

      return http.get(query).map((resp: any) => {
        if (state == 'none') {
          for (const dato of resp.response) {
            if (dato.group == "personal") {
              conteo = conteo + dato.count;
            }

          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {

            if (dato.key == state) {
              conteo = dato.count;
            }

          }


        }
        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state) {
      for (const item of fechas) {
        get_data(item.query, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado);
    return regreso.asObservable();
  }

  //  ----------------------------
  years_getPregnals(i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, state) {
      let conteo = 0;
      let query = ""
      if (state == 'none') {
        query = url + '/unicef/users_by_type' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/pregnants_by_state' + fechas;
      }


      return http.get(query).map((resp: any) => {
        if (state == 'none') {
          for (const dato of resp.response) {
            if (dato.group == "pregnant") {
              conteo = conteo + dato.count;
            }

          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {

            if (dato.key == state) {
              conteo = dato.count;
            }

          }


        }
        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state) {
      for (const item of fechas) {
        get_data(item.query, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado);
    return regreso.asObservable();
  }

  // // --------------**********************
  years_getMomBby(i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, state) {
      let conteo = 0;
      let query = "";
      if (state == 'none') {
        query = url + '/unicef/users_by_type' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/moms_by_state' + fechas;
      }
      return http.get(query).map((resp: any) => {
        if (state == 'none') {
          for (const dato of resp.response) {
            if (dato.group == "baby") {
              conteo = conteo + dato.count;
            }

          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {

            if (dato.key == state) {
              conteo = dato.count;
            }

          }


        }
        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state) {
      for (const item of fechas) {
        get_data(item.query, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado);
    return regreso.asObservable();
  }

  // // ----------------------------******************************************
  years_getMom(grupo, i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;

    function get_data(fechas, grup, state) {
      let conteo = 0;
      let query = "";
      if (state == 'none') {
        query = url + '/unicef/users_by_mom_age' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/mom_age_by_state' + fechas;
      }

      const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];



      return http.get(query).map((resp: any) => {

        if (state == 'none') {
          for (const dato of resp.response) {

            if (dato.group == busqueda[grup]) {
              conteo = dato.count;
            }

          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {
            if (dato.state == state) {
              for (const dta of dato.result) {
                if (dta.group == busqueda[grup]) {
                  conteo = dta.count;
                }
              }
            }
          }

        }

        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, grup, state) {

      for (const item of fechas) {
        get_data(item.query, grup, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };

          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, grupo, estado);


    return regreso.asObservable();
  }

  years_getHospital(grupo, i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;



    function get_data(fechas, grup, state) {
      const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA_SEMAR', 'Farmacias', 'Privado', 'Otro'];

      let conteo = 0;
      let query = "";
      if (state == 'none') {
        query = url + '/unicef/users_by_hospital' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/hospitals_by_state' + fechas;
      }
      return http.get(query).map((resp: any) => {

        if (state == 'none') {
          for (const dato of resp.response) {

            if (dato.key == busqueda[grup]) {
              conteo = conteo + dato.count;
            }

          }

        }
        if (state != 'none') {
          for (const dato of resp.response) {
            if (dato.state == state) {
              for (const dta of dato.result) {
                if (dta.hospital == busqueda[grup]) {
                  conteo = dta.count;
                }

              }

            }
          }
        }

        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, grup, state) {
      for (const item of fechas) {
        get_data(item.query, grup, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, grupo, estado);
    return regreso.asObservable();
  }
  // ************---------------------
  years_getMedio(grupo, i_year, i_mes, f_year, f_mes, estado): Observable<any> {

    const values = [];
    let dates = this.build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;

    function get_data(fechas, grup, state) {
      let conteo = 0;
      let query = "";
      if (state == 'none') {
        query = url + '/unicef/users_by_channel' + fechas;
      }
      if (state != 'none') {
        query = url + '/unicef/channel_by_state' + fechas;
      }

      let buscar;
      return http.get(query).map((resp: any) => {



        if (state == 'none') {
          for (const dato of resp.response) {
            if (dato.key == grup) {
              conteo = dato.count;
            }

          }


        }

        if (state != 'none') {
          switch (grup) {
            case 'facebook':
              buscar = resp.response['facebook'];
              break;
            case 'sms':
              buscar = resp.response['sms'];
              break;
            case 'twitter':
              buscar = resp.response['twitter'];
              break;
          }

          if (Object.keys(buscar).length != 0) {
            const keys = Object.keys(buscar);

            for (const key of keys) {
              if (key == state) {
                conteo = buscar[key];
              }
            }

          }
        }

        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, grup, state) {
      for (const item of fechas) {
        get_data(item.query, grup, state).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, grupo, estado);
    return regreso.asObservable();
  }

  // ---------------MUNICIPIO --------------------------------------

  mun_years_allusers(i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;



    function get_data(fechas, state, mun) {
      let conteo = 0;
      const query = url + '/unicef/users_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {


        for (const dato of resp.response) {
          if (dato.key == mun) {
            conteo = dato.count;
          }

        }



        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state, mun) {
      for (const item of fechas) {
        get_data(item.query, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado, municipio);
    return regreso.asObservable();
  }

  mun_years_BbyState(i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, state, mun) {
      let conteo = 0;
      const query = url + '/unicef/babies_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {

        for (const dato of resp.response) {
          if (dato.key == mun) {
            conteo = dato.count;
          }

        }


        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state, mun) {
      for (const item of fechas) {
        get_data(item.query, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado, municipio);
    return regreso.asObservable();
  }

  mun_years_getPrestador(i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, state, mun) {
      let conteo = 0;
      const query = url + '/unicef/personal_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {

        for (const dato of resp.response) {

          if (dato.key == mun) {
            conteo = dato.count;
          }

        }



        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state, mun) {
      for (const item of fechas) {
        get_data(item.query, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado, municipio);
    return regreso.asObservable();
  }

  // ----------------------------
  mun_years_getPregnals(i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;



    function get_data(fechas, state, mun) {
      let conteo = 0;
      const query = url + '/unicef/pregnants_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {

        for (const dato of resp.response) {

          if (dato.key == mun) {
            conteo = dato.count;
          }

        }

        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state, mun) {
      for (const item of fechas) {
        get_data(item.query, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado, municipio);
    return regreso.asObservable();
  }

  // // --------------**********************
  mun_years_getMomBby(i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    const dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, state, mun) {
      let conteo = 0;
      const query = url + '/unicef/moms_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {

        for (const dato of resp.response) {

          if (dato.key == mun) {
            conteo = dato.count;
          }

        }


        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, state, mun) {
      for (const item of fechas) {
        get_data(item.query, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, estado, municipio);
    return regreso.asObservable();
  }

  // // ----------------------------******************************************
  mun_years_getMom(grupo, i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, grup, state, mun) {
      let conteo = 0;


      const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];

      const query = url + '/unicef/mom_age_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {



        for (const dato of resp.response) {
          if (dato.municipio == mun) {
            for (const dta of dato.result) {
              if (dta.group == busqueda[grup]) {
                conteo = dta.count;
              }
            }
          }
        }



        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, grup, state, mun) {

      for (const item of fechas) {
        get_data(item.query, grup, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };

          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, grupo, estado, municipio);


    return regreso.asObservable();
  }

  mun_years_getHospital(grupo, i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);

    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;



    function get_data(fechas, grup, state, mun) {
      const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA_SEMAR', 'Farmacias', 'Privado', 'Otro'];

      let conteo = 0;
      const query = url + '/unicef/hospitals_by_mun?state=' + state + fechas;

      return http.get(query).map((resp: any) => {


        for (const dato of resp.response) {
          if (dato.municipio == mun) {
            for (const dta of dato.result) {
              if (dta.hospital == busqueda[grup]) {
                conteo = dta.count;
              }

            }

          }
        }


        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, grup, state, mun) {
      for (const item of fechas) {
        get_data(item.query, grup, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, grupo, estado, municipio);
    return regreso.asObservable();
  }
  // ************---------------------
  mun_years_getMedio(grupo, i_year, i_mes, f_year, f_mes, estado, municipio): Observable<any> {

    const values = [];
    let dates = this.mun_build_dates(i_mes, i_year, f_mes, f_year);
    const http = this.http;
    const url = this.url;
    const regreso = this.regresar$;


    function get_data(fechas, grup, state, mun) {
      let conteo = 0;
      const query = url + '/unicef/channel_by_mun?state=' + state + fechas;
      let buscar;
      return http.get(query).map((resp: any) => {

        switch (grup) {
          case 'facebook':
            buscar = resp.response['facebook'];
            break;
          case 'sms':
            buscar = resp.response['sms'];
            break;
          case 'twitter':
            buscar = resp.response['twitter'];
            break;
        }
        if (Object.keys(buscar).length != 0) {
          const keys = Object.keys(buscar);
          for (const key of keys) {
            if (key == mun) {
              conteo = buscar[key];
            }
          }

        }


        return conteo;
      });
    }
    function dealy() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function procesar(fechas, grup, state, mun) {
      for (const item of fechas) {
        get_data(item.query, grup, state, mun).subscribe(resp => {

          const objeto = {
            year: item.year,
            mes: item.mes,
            value: 0
          };
          objeto.value = resp;
          values.push(objeto);
        });
        await dealy();
      }
      regreso.next(values);
    }
    procesar(dates, grupo, estado, municipio);
    return regreso.asObservable();
  }

  build_dates(i_mes, i_year, f_mes, f_year) {
    const dates = [];
    for (let y = i_year; y <= f_year; y++) {

      if (y == i_year) {
        const obj = {
          year: y,
          mes: 0,
          query: ''
        };
        obj.query = `?start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${i_year}-${i_mes}-01T00:00:00`;
        obj.mes = parseInt(i_mes);
        dates.push(obj);
        if (i_mes != 12) {
          const obj2 = {
            year: y,
            mes: 0,
            query: ''
          };
          obj2.query = `?start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${i_year}-12-31T00:00:00`;
          obj2.mes = 12;
          dates.push(obj2);
        }

      } else {
        if (y == f_year) {
          const obj = {
            year: y,
            mes: 0,
            query: ''
          };
          obj.query = `?start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${f_year}-${f_mes}-28T00:00:00`;
          obj.mes = parseInt(f_mes);
          dates.push(obj);

        } else {
          const obj = {
            year: y,
            mes: 0,
            query: ''
          };
          obj.query = `?start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${y}-12-31T00:00:00`;
          obj.mes = 12;
          dates.push(obj);
        }

      }
    }

    return dates;
  }

  mun_build_dates(i_mes, i_year, f_mes, f_year) {
    const dates = [];
    for (let y = i_year; y <= f_year; y++) {

      if (y == i_year) {
        const obj = {
          year: y,
          mes: 0,
          query: ''
        };
        obj.query = `&start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${i_year}-${i_mes}-01T00:00:00`;
        obj.mes = parseInt(i_mes);
        dates.push(obj);
        if (i_mes != 12) {
          const obj2 = {
            year: y,
            mes: 0,
            query: ''
          };
          obj2.query = `&start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${i_year}-12-31T00:00:00`;
          obj2.mes = 12;
          dates.push(obj2);
        }

      } else {
        if (y == f_year) {
          const obj = {
            year: y,
            mes: 0,
            query: ''
          };
          obj.query = `&start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${f_year}-${f_mes}-28T00:00:00`;
          obj.mes = parseInt(f_mes);
          dates.push(obj);

        } else {
          const obj = {
            year: y,
            mes: 0,
            query: ''
          };
          obj.query = `&start_date=${i_year}-${i_mes}-01T00:00:00&end_date=${y}-12-31T00:00:00`;
          obj.mes = 12;
          dates.push(obj);
        }

      }
    }

    return dates;
  }



}
