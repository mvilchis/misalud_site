import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import * as d3 from 'd3';
import { DeviceDetectorService } from 'ngx-device-detector';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  usuarios = 0;
  mensajes = 0;
  tasa = 0;
  deviceInfo = null;
  movile=false;

  constructor(public _headerService: HeaderService,
  private deviceService: DeviceDetectorService) {


  }

  ngOnInit() {
    this.device();
    this._headerService.get_Users().subscribe(resp => {
      this.usuarios = resp;
    });
    this._headerService.get_Msj().subscribe(resp => {
      this.mensajes = resp;
    });
    this._headerService.get_rate().subscribe(resp => {
      this.tasa = Math.round(resp);
    });

  }

  device(){
    this.deviceInfo = this.deviceService.getDeviceInfo();
    if(this.deviceInfo.os=="android" || this.deviceInfo.os=="mac")
    {
      this.movile=true;
    }
  }




}
