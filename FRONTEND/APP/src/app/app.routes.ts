import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { RegistrazioneComponent } from './registrazione/registrazione.component';
import { LoginComponent } from './login/login.component';
import { HOMEComponent } from './home/home.component';
import { Userservice } from './User.service';
import { AirlineHComponent } from './airline-h/airline-h.component';
import { FlightService } from './flight.service';
import { HomeUserComponent } from './home-user/home-user.component';
import { FirstpageComponent } from './firstpage/firstpage.component';

export const routes: Routes = [ 
   { path: '',loadComponent: () => import('./firstpage/firstpage.component').then(m => m.FirstpageComponent),pathMatch:'full'},
    {path:'login',loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)} ,//login route
    { path: 'registrazione',loadComponent: () => import('./registrazione/registrazione.component').then(m => m.RegistrazioneComponent)}, 
    { path: 'home',loadComponent: () => import("./home/home.component").then(m => m.HOMEComponent),canActivate:[Userservice]},
    {path:"Airline",loadComponent:()=>import("./airline-h/airline-h.component").then(m=>m.AirlineHComponent),canActivate:[FlightService]},
     { path: 'home_user',loadComponent: () => import('./home-user/home-user.component').then(m => m.HomeUserComponent)}
  ];
