import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { fmilesPipe } from './pipes/fmiles.pipe';
import { DeviceDetectorModule } from 'ngx-device-detector';
// Routes
import { app_routing } from './app.routes';
// interceptor get idea
import { GetInterceptor } from './interceptors/get-interceptor';
// services
import { MapaService } from './services/mapa.service';
import { UsuariosService } from './services/usuarios.service';
import { MensajesService } from './services/mensajes.service';
import { ImpactoService } from './services/impacto.service';
import { MapainfoService } from './services/mapainfo.service';
import { HeaderService } from './services/header.service';
import { MapainfoChartService } from './services/mapainfo-chart.service';
import { DatemapaService } from './services/datemapa.service';
import { GCsvService } from './services/g-csv.service';
// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { MapainfoComponent } from './components/mapainfo/mapainfo.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ImpactoComponent } from './components/impacto/impacto.component';
import { MensajeComponent } from './components/mensaje/mensaje.component';
import { HeaderMsComponent } from './components/header-ms/header-ms.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MapaComponent,
    MapainfoComponent,
    UsuariosComponent,
    ImpactoComponent,
    MensajeComponent,
    fmilesPipe,
    HeaderMsComponent
  ],
  imports: [
    BrowserModule,
    app_routing,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot(),
    DeviceDetectorModule.forRoot()


  ],
  providers: [
    /*  {
        provide: HTTP_INTERCEPTORS,
        useClass: GetInterceptor,
        multi: true
      },*/
    MapaService,
    UsuariosService,
    MensajesService,
    ImpactoService,
    HeaderService,
    DatemapaService,
    MapainfoChartService,
    MapainfoService,
    GCsvService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
