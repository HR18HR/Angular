import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Buffer } from 'buffer';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, RouterStateSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Ticket_I } from './flight-s.service';

//Interface User-->emial,username,password,role//
export interface User{
  email:string;
  password?:string,
  username:string,
  role?:string,
  FirstTime?:boolean;
}
export interface Token{
  email:string,
  username:string;
  role:string,
  firstTime:boolean;
  Tickets:Ticket_I[]
}

@Injectable({
  providedIn: 'root'
})
export class Userservice implements CanActivate {  // La classe Userservice implementa CanActivate, che serve per proteggere le rotte Angular (es: impedire accesso a una pagina se non si è loggati)
  
  guardHome: boolean = false; // Variabile booleana usata per decidere se attivare o meno la protezione della rotta
  guardAir:boolean=false;




  
  constructor(public Http: HttpClient) {} // Inietto l'HttpClient per poter fare chiamate HTTP (es: POST, GET, DELETE ecc.)






  // Funzione di login: prende username e password, li concatena con ":" e li codifica in base64 per l'autenticazione Basic
  Log_In(username: string, password: string): Observable<{toke:string,message:string}> {
    const header = new HttpHeaders({
      'Authorization': 'Basic ' + Buffer.from(username.concat(':').concat(password)).toString("base64")
    })
    return this.Http.post<{toke:string,message:string}>('http://localhost:3000/login', {}, { headers: header }) // Fa la POST al backend con l'header Authorization
  }







  // Funzione per la registrazione utente normale: invia email, username e password tramite POST
  REGIST(email: string, password: string, username: string): Observable<{message:string}> {
    return this.Http.post<{message:string}>("http://localhost:3000/registrazione", { email: email, username: username, password: password }, {})
  }







  // Funzione per la registrazione di una compagnia aerea: serve il token JWT nell'header Authorization (Bearer token)
  REGIST_Airline(email: string, password: string, username: string,token:string): Observable<{message:string}> {
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.Http.post<{message:string}>("http://localhost:3000/registrazione/airline", { email: email, username: username, password: password }, { headers: header })
  }






  // Funzione per ottenere i dati di un utente specifico (filtrando per username), autorizzata via JWT
  GiveOne(username: string,token:string): Observable<User|User[]> {

    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    if(username!='')return this.Http.get<User>("http://localhost:3000/user?u=" + username, { headers: header })
      else return this.Http.get<User|User[]>("http://localhost:3000/user",{ headers: header })

  }






  // Funzione per eliminare un utente specifico (sempre via username e autorizzazione con JWT)
  DeleteOne(username: string,token:string): Observable<{ message: string }> {
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.Http.delete<{ message: string }>("http://localhost:3000/user/" + username, { headers: header })
  }








// Aggiorna i dati dell'utente (email, username, password) inviando una richiesta PUT con autenticazione
  Update(email: string, password: string, username: string,token:string): Observable<{message:string}> {
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.Http.put<{message:string}>("http://localhost:3000/registrazione/airline", { email: email, username: username, password: password }, { headers: header })
  }






  // Implementazione del metodo canActivate richiesto da CanActivate. Serve per controllare se una rotta può essere attivata o no
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.guardHome; // Se guardHome è true, allora la rotta è accessibile
  }

}
