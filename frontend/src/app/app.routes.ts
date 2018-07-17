import { RouterModule, Routes } from '@angular/router';
import {MapaComponent, MapainfoComponent, UsuariosComponent, MensajeComponent, ImpactoComponent} from './components/index.paginas';



const app_routes: Routes = [
  { path: 'mapa', component: MapaComponent },
  { path: 'info', component: MapainfoComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'mensaje', component: MensajeComponent },
  { path: 'impacto', component: ImpactoComponent },
  { path: '', pathMatch: 'full', redirectTo: 'mapa' },
  { path: '**', pathMatch: 'full', redirectTo: 'mapa' }
];

export const app_routing = RouterModule.forRoot(app_routes);
