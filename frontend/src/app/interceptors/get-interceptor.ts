import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch';


@Injectable()
export class GetInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    if (request.method === 'GET') {
      console.log('entra get peticion');
      const customRequest = request.clone({
        headers: request.headers.set('Cache-Control', 'no-cache')
          .set('Pragma', 'no-cache')
      });
      return next.handle(customRequest);
    }

    return next.handle(request);
  }
}
