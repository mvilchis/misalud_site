import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class ImpactoService {

  public url = 'http://rapidpro.datos.gob.mx';

  constructor(public http: HttpClient) { }


  //doble bar---------------

  get_calidadMomAge(calidad: string, start?: string, end?: string): Observable<any> {

    let query = this.url + '/unicef/calidad_medica_by_mom_age?category=' + calidad;

    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    let gTotal = 0;
    const respuesta = [];

    return this.http.get(query).map((resp: any) => {


      for (const data of resp.response) {
        let total = 0;

        const objeto = {
          'name': '',
          'total': 0,
          'si': 0,
          'no': 0
        };

        objeto.name = data.age.replace(/.0/g, ' ');
        objeto.name = objeto.name.replace('35 -*', '35 o más');
        objeto.name = objeto.name + " años";


        for (const value of data.result) {
          total = total + value.count;

        }
        for (const value of data.result) {
          if (value.calidad == 'Si') {
            objeto.si = (value.count * 100) / total;
          }
          if (value.calidad == 'No') {
            objeto.no = (value.count * 100) / total;
          }

        }

        objeto.total = total;

        dta.push(objeto);

      }

      for (const val of dta) {
        gTotal = gTotal + val.total;
      }

      respuesta[0] = gTotal;
      respuesta[1] = dta;

      return respuesta;

    });
  }

  get_calidadBbyAge(calidad: string, start?: string, end?: string): Observable<any> {
    const trimestres = ['recién nacido', '0 a 3 meses', '4 a 6 meses', '7 a 9 meses', '10 a 12 meses', '13 a 15 meses', '16 a 18 meses', '19 a 21 meses', '2 años'];
    let query = this.url + '/unicef/calidad_medica_by_baby_age?category=' + calidad;

    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    let gTotal = 0;
    const respuesta = [];

    return this.http.get(query).map((resp: any) => {


      for (const data of resp.response) {
        let total = 0;

        const objeto = {
          'name': '',
          'total': 0,
          'si': 0,
          'no': 0
        };

        objeto.name = trimestres[data.baby_age];
        for (const value of data.result) {
          if (value.calidad == 'Si' || value.calidad == 'No') {
            total = total + value.count;
          }

        }
        for (const value of data.result) {
          if (value.calidad == 'Si') {
            objeto.si = (value.count * 100) / total;
          }
          if (value.calidad == 'No') {
            objeto.no = (value.count * 100) / total;
          }

        }
        objeto.total = total;
        dta.push(objeto);

      }
      for (const val of dta) {
        gTotal = gTotal + val.total;
      }

      respuesta[0] = gTotal;
      respuesta[1] = dta;

      return respuesta;

    });
  }

  get_calidadSgestacion(calidad: string, start?: string, end?: string): Observable<any> {
    let query = this.url + '/unicef/calidad_medica_by_pregnant_week?category=' + calidad;

    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    let gTotal = 0;

    const respuesta = [];
    return this.http.get(query).map((resp: any) => {


      for (const data of resp.response) {
        let total = 0;

        const objeto = {
          'name': '',
          'total': 0,
          'si': 0,
          'no': 0
        };

        objeto.name = data.pregnant_week + '';
        for (const value of data.result) {
          if (value.calidad == 'Si' || value.calidad == 'No') {
            total = total + value.count;
          }

        }
        for (const value of data.result) {
          if (value.calidad == 'Si') {
            objeto.si = (value.count * 100) / total;
          }
          if (value.calidad == 'No') {
            objeto.no = (value.count * 100) / total;
          }

        }
        objeto.total = total;
        dta.push(objeto);

      }
      for (const val of dta) {
        gTotal = gTotal + val.total;
      }

      respuesta[0] = gTotal;
      respuesta[1] = dta;


      return respuesta;

    });

  }


  get_calidadAten(calidad: string, start?: string, end?: string): Observable<any> {
    let query = this.url + '/unicef/calidad_medica_by_hospital?category=' + calidad;

    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const dta = [];
    let gTotal = 0;
    const respuesta = [];
    return this.http.get(query).map((resp: any) => {


      for (const data of resp.response) {
        let total = 0;
        const objeto = {
          'name': '',
          'total': 0,
          'si': 0,
          'no': 0
        };

        objeto.name = data.hospital.replace('SP', 'Seguro Pupular');

        for (const value of data.result) {
          if (value.calidad == 'Si') {

            total = total + parseInt(value.count);
          }
          if (value.calidad == 'No') {

            total = total + parseInt(value.count);
          }

        }
        for (const value of data.result) {
          if (value.calidad == 'Si') {
            objeto.si = (value.count * 100) / total;

          }
          if (value.calidad == 'No') {
            objeto.no = (value.count * 100) / total;

          }

        }
        objeto.total = total;
        dta.push(objeto);

      }

      for (const val of dta) {
        gTotal = gTotal + parseInt(val.total);
      }

      respuesta[0] = gTotal;
      respuesta[1] = dta;

      return respuesta;

    });

  }

  get_calidadMedio(calidad: string, start?: string, end?: string): Observable<any> {
    let query = this.url + '/unicef/calidad_medica_by_channel?category=' + calidad;

    if (start != 'none') {
      query = query + '&start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }


    const dta = [];
    let total = 0;
    const respuesta = [];
    return this.http.get(query).map((resp: any) => {

      const fb = {
        'name': 'Facebook',
        'total': 0,
        'si': 0,
        'no': 0
      };

      if (resp.response.facebook.No >= 0) {
        fb.no = resp.response.facebook.No;
        fb.total = fb.no;
      }
      if (resp.response.facebook.Si >= 0) {
        fb.si = resp.response.facebook.Si;
        fb.total = fb.total + fb.si;
      }
      if (fb.total > 0) {
        fb.si = (fb.si * 100) / fb.total;
        fb.no = (fb.no * 100) / fb.total;

      }



      const sms = {
        'name': 'SMS',
        'total': 0,
        'si': 0,
        'no': 0
      };

      if (resp.response.sms.No >= 0) {

        sms.no = resp.response.sms.No;
        sms.total = sms.no;
      }
      if (resp.response.sms.Si >= 0) {
        sms.si = resp.response.sms.Si;
        sms.total = sms.total + sms.si;
      }

      if (sms.total > 0) {
        sms.si = (sms.si * 100) / sms.total;
        sms.no = (sms.no * 100) / sms.total;
      }

      const tw = {
        'name': 'Twitter',
        'total': 0,
        'si': 0,
        'no': 0
      };

      if (resp.response.twitter.No >= 0) {
        tw.no = resp.response.twitter.No;
        tw.total = tw.no;
      }
      if (resp.response.twitter.Si >= 0) {
        tw.si = resp.response.twitter.Si;
        tw.total = tw.total + tw.si;
      }
      if (tw.total > 0) {
        tw.si = (tw.si * 100) / tw.total;
        tw.no = (tw.no * 100) / tw.total;
      }


      dta.push(fb);
      dta.push(sms);
      dta.push(tw);

      for (const val of dta) {
        total = total + parseInt(val.total);
      }

      respuesta[0] = total;
      respuesta[1] = dta;

      return respuesta;

    });

  }









  //barra simple

  get_cancelType(grupo, start, end): Observable<any> {

    const razones = [
      { 'razon': 1, 'name': 'Perdí a mi bebé', 'size': 0 },
      { 'razon': 2, 'name': 'Información poco útil', 'size': 0 },
      { 'razon': 3, 'name': 'Demasiados mensajes', 'size': 0 },
      { 'razon': 4, 'name': 'No quiero o puedo responder', 'size': 0 },
      { 'razon': 5, 'name': 'Otra', 'size': 0 }
    ];
    let query = this.url + '/unicef/cancela_by_group';

    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }



    const grupos = ['baby', 'personal', 'pregnant'];

    const result = [];
    const lbl = [];
    let total = 0;

    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      for (const obj of razones) {

        for (const dato of resp.response[grupo]) {

          if (obj.razon == dato.reason) {
            obj.size = obj.size + dato.count;
            total = total + parseInt(dato.count);
          }
        }


      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }


      result[0] = total; /// total results
      result[1] = razones; // for legens
      return result;
    });


  }


  get_cancelMomAge(grupo, start, end): Observable<any> {

    const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];


    let query = this.url + '/unicef/cancela_by_mom_age';

    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const razones = [
      { 'razon': 1, 'name': 'Perdí a mi bebé', 'size': 0 },
      { 'razon': 2, 'name': 'Información poco útil', 'size': 0 },
      { 'razon': 3, 'name': 'Demasiados mensajes', 'size': 0 },
      { 'razon': 4, 'name': 'No quiero o puedo responder', 'size': 0 },
      { 'razon': 5, 'name': 'Otra', 'size': 0 }
    ];
    const result = [];
    let total = 0;
    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects

      for (const dta of resp.response) {

        if (dta.group == busqueda[grupo]) {
          for (const obj of razones) {

            for (const dato of dta.result) {


              if (obj.razon == dato.reason) {

                obj.size = obj.size + dato.count;
                total = total + parseInt(dato.count);
              }
            }
          }
        }
      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }


      result[0] = total; /// total results
      result[1] = razones; // for legens



      return result;
    });


  }

  get_cancelBbyAge(grupo, start, end): Observable<any> {


    let query = this.url + '/unicef/cancela_by_baby_age';

    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }

    const razones = [
      { 'razon': 1, 'name': 'Perdí a mi bebé', 'size': 0 },
      { 'razon': 2, 'name': 'Información poco útil', 'size': 0 },
      { 'razon': 3, 'name': 'Demasiados mensajes', 'size': 0 },
      { 'razon': 4, 'name': 'No quiero o puedo responder', 'size': 0 },
      { 'razon': 5, 'name': 'Otra', 'size': 0 }
    ];
    const result = [];
    let total = 0;

    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      //console.log(razones);
      for (const dta of resp.response) {
        //console.log(grupo);
        if (dta.trimester == grupo) {

          for (const obj of razones) {
            //  console.log(obj);
            for (const dato of dta.result) {
              //   console.log(dato);

              if (obj.razon == dato.reason) {
                //    console.log("entra"+dato.count);
                obj.size = obj.size + dato.count;
                total = total + parseInt(dato.count);
              }
            }
          }
        }
      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }


      result[0] = total; /// total results
      result[1] = razones; // for legens



      return result;
    });

  }

  get_cancelHospital(grupo, start, end): Observable<any> {
    const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA', 'Farmacias', 'Privado', 'Otro'];


    let query = this.url + '/unicef/cancela_by_hospital';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const razones = [
      { 'razon': 1, 'name': 'Perdí a mi bebé', 'size': 0 },
      { 'razon': 2, 'name': 'Información poco útil', 'size': 0 },
      { 'razon': 3, 'name': 'Demasiados mensajes', 'size': 0 },
      { 'razon': 4, 'name': 'No quiero o puedo responder', 'size': 0 },
      { 'razon': 5, 'name': 'Otra', 'size': 0 }
    ];
    const result = [];
    let total = 0;

    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      //console.log(razones);
      for (const dta of resp.response) {
        if (dta.hospital == busqueda[grupo]) {
          //console.log(grupo);
          for (const obj of razones) {
            //  console.log(obj);
            for (const dato of dta.result) {
              //   console.log(dato);

              if (obj.razon == dato.reason) {
                //    console.log("entra"+dato.count);
                obj.size = obj.size + dato.count;
                total = total + parseInt(dato.count);
              }
            }
          }
        }
      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }


      result[0] = total; /// total results
      result[1] = razones; // for legens


      return result;
    });

  }

  get_cancelMedio(grupo, start, end): Observable<any> {


    const razones = [
      { 'razon': 1, 'name': 'Perdí a mi bebé', 'size': 0 },
      { 'razon': 2, 'name': 'Información poco útil', 'size': 0 },
      { 'razon': 3, 'name': 'Demasiados mensajes', 'size': 0 },
      { 'razon': 4, 'name': 'No quiero o puedo responder', 'size': 0 },
      { 'razon': 5, 'name': 'Otra', 'size': 0 }
    ];
    let query = this.url + '/unicef/cancela_by_channel';

    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const grupos = ['facebook', 'tel', 'twitter'];

    const result = [];
    let total = 0;

    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      for (const obj of razones) {

        for (const dato of resp.response[grupo]) {

          if (obj.razon == dato.reason) {
            obj.size = obj.size + dato.count;
            total = total + parseInt(dato.count);
          }
        }


      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }

      result[0] = total; /// total results
      result[1] = razones; // for legens
      return result;
    });



  }

  get_cancelReason(start, end): Observable<any> {


    let query = this.url + '/unicef/cancela_by_type';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const razones = [
      { 'razon': 1, 'name': 'Perdí a mi bebé', 'size': 0 },
      { 'razon': 2, 'name': 'Información poco útil', 'size': 0 },
      { 'razon': 3, 'name': 'Demasiados mensajes', 'size': 0 },
      { 'razon': 4, 'name': 'No quiero o puedo responder', 'size': 0 },
      { 'razon': 5, 'name': 'Otra', 'size': 0 }
    ];
    const result = [];

    let total = 0;

    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      //console.log(razones);
      for (const grupo of resp.response.response) {
        //console.log(grupo);
        for (const obj of razones) {
          //  console.log(obj);


          if (obj.razon == grupo.reason) {
            //    console.log("entra"+dato.count);
            obj.size = obj.size + grupo.count;
            total = total + parseInt(grupo.count);
          }

        }
      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }


      result[0] = total; /// total results
      result[1] = razones; // for legens


      return result;
    });




  }




  /// TreeMap services-----------------------------------------------------------------------------------------

  get_alertType(grupo, start, end): Observable<any> {

    const razones = [
      { 'razon': 1, 'name': 'Emergencia médica', 'size': 0 },
      { 'razon': 2, 'name': 'Señal de alerta', 'size': 0 },
      { 'razon': 3, 'name': 'Preocupación', 'size': 0 },
      { 'razon': 4, 'name': 'Fue un error', 'size': 0 }
    ];
    let query = this.url + '/unicef/mialerta_by_group';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const grupos = ['baby', 'personal', 'pregnant'];

    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      for (const obj of razones) {

        for (const dato of resp.response[grupo]) {

          if (obj.razon == dato.reason) {
            obj.size = obj.size + dato.count;
            total = total + parseInt(dato.count);
          }
        }


      }


      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }
      dta.children = razones;
      razones.sort(function(a, b) {
        if (a.size < b.size) {
          return 1;
        }
        if (a.size > b.size) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      result[0] = total; /// total results
      result[1] = razones; // for legens
      result[2] = dta; //for tree map

      return result;
    });


  }
  get_alertMomAge(grupo, start, end): Observable<any> {
    const busqueda = ['0.0-19.0', '19.0-35.0', '35.0-*'];

    let query = this.url + '/unicef/mialerta_by_mom_age';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const razones = [
      { 'razon': 1, 'name': 'Emergencia médica', 'size': 0 },
      { 'razon': 2, 'name': 'Señal de alerta', 'size': 0 },
      { 'razon': 3, 'name': 'Preocupación', 'size': 0 },
      { 'razon': 4, 'name': 'Fue un error', 'size': 0 }
    ];
    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects

      for (const dta of resp.response) {
        //console.log(grupo);
        if (dta.group == busqueda[grupo]) {
          for (const obj of razones) {
            //  console.log(obj);
            for (const dato of dta.result) {
              //  console.log(dato);

              if (obj.razon == dato.reason) {

                obj.size = obj.size + dato.count;
                total = total + parseInt(dato.count);
              }
            }
          }
        }
      }
      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }
      dta.children = razones;
      razones.sort(function(a, b) {
        if (a.size < b.size) {
          return 1;
        }
        if (a.size > b.size) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      result[0] = total; /// total results
      result[1] = razones; // for legens
      result[2] = dta; //for tree map


      return result;
    });






  }

  get_alertBbyAge(grupo, start, end): Observable<any> {




    let query = this.url + '/unicef/mialerta_by_baby_age';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const razones = [
      { 'razon': 1, 'name': 'Emergencia médica', 'size': 0 },
      { 'razon': 2, 'name': 'Señal de alerta', 'size': 0 },
      { 'razon': 3, 'name': 'Preocupación', 'size': 0 },
      { 'razon': 4, 'name': 'Fue un error', 'size': 0 }
    ];
    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects

      for (const dta of resp.response) {

        if (dta.trimester == grupo) {

          for (const obj of razones) {

            for (const dato of dta.result) {
              //   console.log(dato);

              if (obj.razon == dato.reason) {
                //    console.log("entra"+dato.count);
                obj.size = obj.size + dato.count;
                total = total + parseInt(dato.count);
              }
            }
          }
        }
      }
      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }
      dta.children = razones;
      razones.sort(function(a, b) {
        if (a.size < b.size) {
          return 1;
        }
        if (a.size > b.size) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
      result[0] = total; /// total results
      result[1] = razones; // for legens
      result[2] = dta; //for tree map


      return result;
    });

  }

  get_alertHospital(grupo, start, end): Observable<any> {

    const busqueda = ['IMSS', 'ISSSTE', 'SP', 'Inst Nac', 'Pemex', 'SEDENA', 'Farmacias', 'Privado', 'Otro'];


    let query = this.url + '/unicef/mialerta_by_hospital';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const razones = [
      { 'razon': 1, 'name': 'Emergencia médica', 'size': 0 },
      { 'razon': 2, 'name': 'Señal de alerta', 'size': 0 },
      { 'razon': 3, 'name': 'Preocupación', 'size': 0 },
      { 'razon': 4, 'name': 'Fue un error', 'size': 0 }
    ];
    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    //create objects with name

    return this.http.get(query).map((resp: any) => {

      //build objects
      //.log(razones);
      for (const dta of resp.response) {
        if (dta.hospital == busqueda[grupo]) {
          //console.log(grupo);
          for (const obj of razones) {
            //  console.log(obj);
            for (const dato of dta.result) {
              //   console.log(dato);

              if (obj.razon == dato.reason) {
                //    console.log("entra"+dato.count);
                obj.size = obj.size + dato.count;
                total = total + parseInt(dato.count);
              }
            }
          }
        }
      }
      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }
      dta.children = razones;
      razones.sort(function(a, b) {
        if (a.size < b.size) {
          return 1;
        }
        if (a.size > b.size) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      result[0] = total; /// total results
      result[1] = razones; // for legens
      result[2] = dta; //for tree map


      return result;
    });

  }

  get_alertMedio(grupo, start, end): Observable<any> {


    const razones = [
      { 'razon': 1, 'name': 'Emergencia médica', 'size': 0 },
      { 'razon': 2, 'name': 'Señal de alerta', 'size': 0 },
      { 'razon': 3, 'name': 'Preocupación', 'size': 0 },
      { 'razon': 4, 'name': 'Fue un error', 'size': 0 }
    ];
    let query = this.url + '/unicef/mialerta_by_channel';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const grupos = ['facebook', 'tel', 'twitter'];

    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      for (const obj of razones) {

        for (const dato of resp.response[grupo]) {

          if (obj.razon == dato.reason) {
            obj.size = obj.size + dato.count;
            total = total + parseInt(dato.count);
          }
        }


      }


      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }
      dta.children = razones;
      razones.sort(function(a, b) {
        if (a.size < b.size) {
          return 1;
        }
        if (a.size > b.size) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      result[0] = total; /// total results
      result[1] = razones; // for legens
      result[2] = dta; //for tree map

      return result;
    });



  }

  get_alertReason(start, end): Observable<any> {



    let query = this.url + '/unicef/mialerta_by_type';
    if (start != 'none') {
      query = query + '?start_date=' + start;
    }
    if (end != 'none') {
      query = query + '&end_date=' + end;
    }
    const razones = [
      { 'razon': 1, 'name': 'Emergencia médica', 'size': 0 },
      { 'razon': 2, 'name': 'Señal de alerta', 'size': 0 },
      { 'razon': 3, 'name': 'Preocupación', 'size': 0 },
      { 'razon': 4, 'name': 'Fue un error', 'size': 0 }
    ];
    const result = [];
    const lbl = [];
    let total = 0;
    const dta = {
      'children': []
    };
    //create objects with name

    return this.http.get(query).map((resp: any) => {


      //build objects
      //console.log(razones);
      for (const grupo of resp.response.response) {
        //console.log(grupo);
        for (const obj of razones) {
          //  console.log(obj);


          if (obj.razon == grupo.reason) {
            //    console.log("entra"+dato.count);
            obj.size = obj.size + grupo.count;
            total = total + parseInt(grupo.count);
          }

        }
      }

      //build percent
      for (const obj of razones) {
        obj.size = (obj.size * 100) / total;
      }
      dta.children = razones;
      razones.sort(function(a, b) {
        if (a.size < b.size) {
          return 1;
        }
        if (a.size > b.size) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      result[0] = total; /// total results
      result[1] = razones; // for legens
      result[2] = dta; //for tree map


      return result;
    });

  }

  carga_help() {
    return this.http.get('assets/help/impacto.json');
  }
}
