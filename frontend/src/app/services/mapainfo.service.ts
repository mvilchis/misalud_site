import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class MapainfoService {

  public url = 'http://rapidpro.datos.gob.mx';

  //   private regresoFuente = new BehaviorSubject<any>([]);
  // public regreso$ = this.regresoFuente.asObservable();
  private regresar$ = new Subject<any>();

  public subvariable = [{

    value: 'users',
    variable: 'principal',
    texto: 'Subvariables'
  },
  {

    value: 'tPregnal',
    texto: 'Tipo / Embarazadas'
  },
  {

    value: 'tMomBby',
    texto: 'Tipo / Mamás con bebé'
  },
  {

    value: 'tPrestador',
    texto: 'Tipo / Prestador de servicios'
  },
  {

    value: 'm18',
    texto: 'Edad de la mamá / 0 a 18 años'
  },
  {

    value: 'm35',
    texto: 'Edad de la mamá / 19 a 35 años'
  },
  {

    value: 'mMas',
    texto: 'Edad de la mamá / 35 años o más'
  },

  {

    value: 'hImss',
    texto: 'Recibe atención médica / IMSS'
  },
  {

    value: 'hIsste',
    texto: 'Recibe atención médica / ISSSTE'
  },
  {

    value: 'hSP',
    texto: 'Recibe atención médica / Seguro Popular'
  },

  {

    value: 'hInst',
    texto: 'Recibe atención médica / Inst Nac.'
  },
  {

    value: 'hPemex',
    texto: 'Recibe atención médica / PEMEX'
  },
  {

    value: 'hSedena',
    texto: 'Recibe atención médica / SEDENA o SEMAR'

  },
  {

    value: 'hFarm',
    texto: 'Recibe atención médica / Farmacias'
  },
  {

    value: 'hPrivado',
    texto: 'Recibe atención médica / Privado'
  },
  {

    value: 'hOtro',
    texto: 'Recibe atención médica / Otro'
  },

  {

    value: 'mSMS',
    texto: 'Inscritas a través de SMS'
  }
    ,

  {

    value: 'mFB',
    texto: 'Inscritas a través de Facebook'
  }
    ,

  {

    value: 'mTW',
    texto: 'Inscritas a través de Twitter'
  }


  ];

  public subvariable_two = [{

    value: 'users',
    texto: 'Todos los usuarios'
  },
  {

    value: 'bbyState',
    texto: 'Todos los bebés'
  },
  {

    value: 'tPregnal',
    texto: 'Tipo / Embarazadas'
  },
  {

    value: 'tMomBby',
    texto: 'Tipo / Mamás con bebé'
  },
  {

    value: 'tPrestador',
    texto: 'Tipo / Prestador de servicios'
  },
  {

    value: 'm18',
    texto: 'Edad de la mamá / 0 a 18 años'
  },
  {

    value: 'm35',
    texto: 'Edad de la mamá / 19 a 35 años'
  },
  {

    value: 'mMas',
    texto: 'Edad de la mamá / 35 años o más'
  },

  {

    value: 'hImss',
    texto: 'Recibe atención médica / IMSS'
  },
  {

    value: 'hIsste',
    texto: 'Recibe atención médica / ISSSTE'
  },
  {

    value: 'hSP',
    texto: 'Recibe atención médica / Seguro Popular'
  },

  {

    value: 'hInst',
    texto: 'Recibe atención médica / Inst Nac.'
  },
  {

    value: 'hPemex',
    texto: 'Recibe atención médica / PEMEX'
  },
  {

    value: 'hSedena',
    texto: 'Recibe atención médica / SEDENA o SEMAR'

  },
  {

    value: 'hFarm',
    texto: 'Recibe atención médica / Farmacias'
  },
  {

    value: 'hPrivado',
    texto: 'Recibe atención médica / Privado'
  },
  {

    value: 'hOtro',
    texto: 'Recibe atención médica / Otro'
  },

  {

    value: 'mSMS',
    texto: 'Inscritas a través de SMS'
  }
    ,

  {

    value: 'mFB',
    texto: 'Inscritas a través de Facebook'
  }
    ,

  {

    value: 'mTW',
    texto: 'Inscritas a través de Twitter'
  }


  ];
  constructor(public http: HttpClient) {

  }

  private getHeaders(): HttpHeaders {

    const headers = new HttpHeaders({
      'Accept': '/'

    });

    return headers;
  }



  cargaMunicipios(estado): Observable<any> {

    return this.http.get('assets/mapa/municipios.json').map((resp: any) => {

      // console.log(resp);
      const municipios = [];
      for (const mun of resp) {
        if (mun.cve_ent == estado) {
          municipios.push(mun);
        }
      }
      return municipios;
    });

  }



  cargaEstados() {
    return this.http.get('assets/mapa/estados.json');
  }

  getAllUsers(start, end): Observable<any> {

    const datos = [];

    let query = this.url + `/unicef/users_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }


    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      let nacional = 0;
      const respuesta = [];


      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };

        objeto.cve_ent = dato.key;
        objeto.count = dato.count;
        nacional = nacional + parseInt(dato.count);
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;
      //  console.log(data);



    });

  }
  getPregnals(start, end): Observable<any> {

    let query = this.url + `/unicef/pregnants_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const datos = [];
    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      let nacional = 0;
      const respuesta = [];

      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };
        objeto.cve_ent = dato.key;
        objeto.count = dato.count;
        nacional = nacional + parseInt(dato.count);
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;

    });

  }

  getMomBby(start, end): Observable<any> {

    let query = this.url + `/unicef/moms_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const datos = [];
    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      let nacional = 0;
      const respuesta = [];

      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };
        objeto.cve_ent = dato.key;
        objeto.count = dato.count;
        nacional = nacional + parseInt(dato.count);
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;

    });

  }
  getPrestador(start, end): Observable<any> {

    let query = this.url + `/unicef/personal_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const datos = [];
    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      let nacional = 0;
      const respuesta = [];

      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };
        objeto.cve_ent = dato.key;
        objeto.count = dato.count;
        nacional = nacional + parseInt(dato.count);
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;

    });

  }

  getMom(grupo, start, end): Observable<any> {
    const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];
    const datos = [];

    let query = this.url + `/unicef/mom_age_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    let nacional = 0;
    const respuesta = [];

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };
        objeto.cve_ent = dato.state;
        // busqueda del grupo
        for (const edad of dato.result) {
          if (edad.group == busqueda[grupo]) {
            nacional = nacional + parseInt(edad.count);
            objeto.count = edad.count;
          }
        }
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;
    });

  }

  getHospital(grupo, start, end): Observable<any> {
    const grupos = ['hImss', 'hIsste', 'hSP', 'hInst', 'hPemex', 'hSedena', 'hFarm', 'hPrivado', 'hOtro'];
    const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA', 'Farmacias', 'Privado', 'Otro'];

    const datos = [];

    let query = this.url + `/unicef/hospitals_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    let nacional = 0;
    const respuesta = [];

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };
        objeto.cve_ent = dato.state;
        // busqueda del grupo
        for (const hosp of dato.result) {
          if (hosp.hospital == busqueda[grupo]) {
            nacional = nacional + parseInt(hosp.count);
            objeto.count = hosp.count;
          }
        }
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;
    });

  }

  getMedio(grupo, start, end): Observable<any> {


    const datos = [];

    let query = this.url + `/unicef/channel_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    let busqueda;
    let nacional = 0;
    const respuesta = [];

    return this.http.get(query).map((resp: any) => {
      //  console.log("Entra get");
      //    console.log(resp);
      // cambio de campos en el objeto

      switch (grupo) {
        case 'facebook':
          busqueda = resp.response.facebook;
          break;
        case 'sms':
          busqueda = resp.response.sms;
          break;
        case 'twitter':
          busqueda = resp.response.twitter;
          break;
      }



      for (let i = 1; i < 33; i++) {
        let cve = i + '';
        cve = cve.padStart(2, '0');
        const objeto = {
          cve_ent: '',
          count: 0
        };


        nacional = nacional + parseInt(busqueda[cve]);

        objeto.cve_ent = cve;
        objeto.count = busqueda[cve];
        // busqueda del grupo
        datos.push(objeto);
      }

      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;
    });

  }


  getUserType(start, end) {

    let query = this.url + `/unicef/users_by_type`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query);


  }


  getBbyState(start, end): Observable<any> {

    let query = this.url + `/unicef/babies_by_state`;
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const datos = [];
    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      let nacional = 0;
      const respuesta = [];

      for (const dato of resp.response) {
        const objeto = {
          cve_ent: '',
          count: 0
        };
        objeto.cve_ent = dato.key;
        objeto.count = dato.count;
        nacional = nacional + parseInt(dato.count);
        datos.push(objeto);
      }
      respuesta[0] = nacional;
      respuesta[1] = datos;

      return respuesta;

    });

  }
  // FIN ESTADOS

  // ----------------------Municipio-------------------------

  // obtener la cuenta de los usuarios por estado: return arreglo de objetos
  mun_getAllUsers(estado, start, end): Observable<any> {


    const datos = [];
    let query = this.url + `/unicef/users_by_mun?state=${estado}`;

    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto


      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };

        objeto.cve_comb = dato.key;
        objeto.count = dato.count;

        datos.push(objeto);
      }


      // console.log(datos);
      return datos;

    });

  }
  mun_getPregnals(estado, start, end): Observable<any> {
    const datos = [];
    let query = this.url + `/unicef/pregnants_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto


      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };

        objeto.cve_comb = dato.key;
        objeto.count = dato.count;

        datos.push(objeto);
      }


      // console.log(datos);
      return datos;

    });
  }
  mun_getMomBby(estado, start, end): Observable<any> {
    const datos = [];
    let query = this.url + `/unicef/moms_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto


      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };

        objeto.cve_comb = dato.key;
        objeto.count = dato.count;

        datos.push(objeto);
      }


      // console.log(datos);
      return datos;

    });
  }
  mun_getPrestador(estado, start, end): Observable<any> {
    const datos = [];
    let query = this.url + `/unicef/personal_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto


      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };

        objeto.cve_comb = dato.key;
        objeto.count = dato.count;

        datos.push(objeto);
      }


      // console.log(datos);
      return datos;

    });
  }


  mun_getMom(grupo, estado, start, end): Observable<any> {
    const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];
    const datos = [];

    let query = this.url + `/unicef/mom_age_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }


    return this.http.get(query).map((resp: any) => {
      // cambio de campos en el objeto
      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };
        objeto.cve_comb = dato.municipio;
        // busqueda del grupo
        for (const edad of dato.result) {
          if (edad.group == busqueda[grupo]) {

            objeto.count = edad.count;
          }
        }
        datos.push(objeto);
      }


      return datos;
    });

  }

  mun_getHospital(grupo, estado, start, end): Observable<any> {
    const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA_SEMAR', 'Farmacias', 'Privado', 'Otro'];
    const datos = [];

    let query = this.url + `/unicef/hospitals_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto
      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };
        objeto.cve_comb = dato.municipio;
        // busqueda del grupo
        for (const hosp of dato.result) {
          if (hosp.hospital == busqueda[grupo]) {

            objeto.count = hosp.count;
          }
        }
        datos.push(objeto);
      }

      return datos;
    });

  }

  mun_getbbyState(estado, start, end): Observable<any> {


    const datos = [];
    let query = this.url + `/unicef/babies_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    return this.http.get(query).map((resp: any) => {

      // cambio de campos en el objeto


      for (const dato of resp.response) {
        const objeto = {
          cve_comb: '',
          count: 0
        };

        objeto.cve_comb = dato.key;
        objeto.count = dato.count;

        datos.push(objeto);
      }


      // console.log(datos);
      return datos;

    });

  }

  mun_getMedio(grupo, estado, start, end): Observable<any> {


    const datos = [];

    let query = this.url + `/unicef/channel_by_mun?state=${estado}`;
    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    let busqueda;
    const nacional = 0;
    const respuesta = [];

    return this.http.get(query).map((resp: any) => {
      //  console.log("Entra get");
      //    console.log(resp);
      // cambio de campos en el objeto

      switch (grupo) {
        case 'facebook':
          busqueda = resp.response['facebook'];
          break;
        case 'sms':
          busqueda = resp.response['sms'];
          break;
        case 'twitter':
          busqueda = resp.response['twitter'];
          break;
      }
      const keys = Object.keys(busqueda);


      for (const key of keys) {
        const objeto = {
          cve_comb: '',
          count: 0
        };

        objeto.cve_comb = key;
        objeto.count = busqueda[key];

        datos.push(objeto);
      }


      // console.log(datos);
      return datos;

    });

  }




  get_nacional(start, end): Observable<any> {



    const query = this.url + `/unicef/users_by_channel?start_date=${start}&end_date=${end}`;

    return this.http.get(query).map((resp: any) => {
      let total = 0;


      for (const dato of resp.response) {
        total = total + parseInt(dato.count);
      }

      return total;

    });


  }

  get_allType(grupo) {

    let total = 0;
    const query = this.url + '/unicef/users_by_type';

    return this.http.get(query).map((resp: any) => {
      for (const dta of resp.response) {
        if (dta.group == grupo) {
          total = dta.count;
        }
      }
      return total;
    });
  }
  get_allMage(grupo, start, end) {
    const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];
    let total = 0;
    let query = this.url + '/unicef/users_by_mom_age';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    return this.http.get(query).map((resp: any) => {
      for (const dta of resp.response) {
        if (dta.group == busqueda[grupo]) {
          total = dta.count;
        }
      }
      return total;
    });

  }
  get_allAtencion(grupo, start, end): Observable<any> {
    const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA_SEMAR', 'Farmacias', 'Privado', 'Otro'];
    let total = 0;
    let query = this.url + '/unicef/users_by_hospital';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    return this.http.get(query).map((resp: any) => {
      for (const dta of resp.response) {
        if (dta.key == busqueda[grupo]) {
          total = dta.count;
        }
      }
      return total;
    });
  }
  get_allChannel(grupo, start, end): Observable<any> {
    let total = 0;
    let query = this.url + '/unicef/users_by_channel';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    return this.http.get(query).map((resp: any) => {
      for (const dta of resp.response) {
        if (dta.key == grupo) {
          total = dta.count;
        }
      }
      return total;
    });

  }
  carga_help() {
    return this.http.get('assets/help/info.json');
  }




}
