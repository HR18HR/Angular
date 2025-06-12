import { Injectable, Type } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight_I } from './flight.service';


//interface flight tolto revenue passangers e state e aircraft
 export type Flight_s =Omit<Flight_I,'revenue Passengers state aircraft'>;



  //interface Ticket  uguale a quella su mongo
 export interface Ticket_I{
  passanger:string,
  Date:string;
  route:{from:string,to:string},
  DepartureTime:string;
  id_f:string;
  id_transaction:string;
  seat:{cost:number,type:string,quantity:number},
  extra_b_20kg:boolean;
}

 

@Injectable({
  providedIn: 'root'
})
export class FlightSService {

  constructor(public http :HttpClient) {}


/***********************************************FUNZIONE DI RICERCA VOLO */

  // Trasformo il valore di 'from' in maiuscolo, così evito problemi con le lettere minuscole
  // Faccio lo stesso con 'to', sempre per avere un confronto più preciso
  // Invio una richiesta POST al server con l'oggetto Cerca_F
  // Mi aspetto di ricevere indietro un messaggio e una lista di voli (flights)

  SearchF(Cerca_F:{from:string,to:string}):Observable<{message:string,flights:Flight_s[]}>{
    return this.http.post<{message:string,flights:Flight_s[]}>('http://localhost:3000/search/flights',{Cerca_F:Cerca_F})

  }



/***********************************************FUNZIONE DI ACQUISTO BIGLIETTO */


  // Creo l'header con il token JWT preso dal localStorage per autorizzare la richiesta
 // Faccio una POST al server per acquistare il volo con l'id specificato
  // Invio i dati del biglietto (biglietto_d) nel body della richiesta
  // Passo anche gli headers con il token per autenticarmi
  // Mi aspetto di ricevere un messaggio, il biglietto e volo aggiornato

 PurchaseT(id:string,biglietto_d:any,token:string):Observable<{message:string,biglietto:Ticket_I,flight_p:Flight_s}>{
      const header = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
     return  this.http.post<{message:string,biglietto:Ticket_I,flight_p:Flight_s}>('http://localhost:3000/purchase/flight/'+id,{biglietto_d:biglietto_d},{headers:header})
    }
  


  


}
