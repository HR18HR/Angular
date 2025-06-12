import { Component,NgModule,OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Token } from '../User.service';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { FlightSService,Flight_s, Ticket_I} from '../flight-s.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home-user',
  imports: [NgIf,FormsModule,NgFor,UpperCasePipe],
  templateUrl: './home-user.component.html',
  styleUrl: './home-user.component.css'
})
export class HomeUserComponent {
name:string='';
Notlogged=false;
token:string='';
risposta:string=''; //mostar i messaggi ricevuti dal backend
res:{Pos:number,Neg:number}={Pos:0,Neg:0} //oggetto che mostra il div della risposta backend


/****************************************** VARIABILI RICERCA VOLO */

Cerca_F:{from:string,to:string,date:string}={from:'',to:'',date:''};  //ogetto per ricerca voli , biding input per ricerca volo
Flights:Flight_s[]=[] //array voli trovati 

/****************************************** VARIABILI FILTRA VOLO */

fs:any[]=[]; //array appoggio per filtrare
range_price:number=0; //biding input filtra prezzo
range_duration:number=0; //biding input durata volo
scalo:boolean=false; //biding input filtra scalo
risultato:string="Nessun volo corrisponde ai tuoi criteri";
risultato_bo:boolean=false; //mostra div con risultato delle ricerche se vuoto
filtra_b:boolean=false; //mostra div che permette di filtrare i voli 

/****************************************** VARIABILI ACQUISTA VOLO */

flight_t:any;//volo che voglio acquistare 
Tickets:Ticket_I[]=[];//array tickets
acquista_b:boolean=false; //attivo il div per acquisti 
biglietto_d:{n:number,type:string,extra_b:false,cost:number,DepartureTime:string,Date:string,route:{from:string,to:string}}={n:0,type:'',extra_b:false,cost:0,DepartureTime:'',Date:'',route:{from:'',to:''}};//bilgietto
message:string=''; //messaggio se l'utente riceve 401 perhè non loggato

bool_t=false; //mostar div tickets ;


constructor(public service:FlightSService,public router :Router){}


/********************************************************* RICERCA BIGLIETTO CON SERVIZIO*/

// Controllo se ci sono elementi mancanti nel form di ricerca
// Mostro un alert se mancano dati
// Converto in maiuscolo i campi "from" e "to" per uniformare l'input
// Chiamata al servizio per effettuare la ricerca dei voli
//Salvo i voli ricevuti se non ci sono errori e se ci sono voli che corrispondo alla mia ricerca

SearchF(){
  if(this.UndefinedEl(Object.values(this.Cerca_F)))alert("DATA MANCANTI PER LA RICERCA")
  else {
    this.Cerca_F.from=this.Cerca_F.from.toUpperCase();
    this.Cerca_F.to=this.Cerca_F.to.toUpperCase();
  this.service.SearchF(this.Cerca_F).subscribe({

    next: data => {
      this.risposta = data.message; // Mostro messaggio ricevuto 
      this.Flights=data.flights;
      this.fs=data.flights;
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0,this.Cerca_F={from:'',to:'',date:''}}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    // Se c’è un errore
    error: err => {
      this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 3000); // Mostro l’errore per 3 secondi

      }
         
    
  })
}
}


/********************************************************* ACQUISTO bIGLIETTO CON SERVIZIO*/

// Recupero l'oggetto dei prezzi dal volo selezionato
// Scorro tutte le chiavi dell'oggetto prezzi
// Se il tipo di biglietto corrisponde a quello selezionato.
// ...assegno il costo corrispondente al biglietto
// incremento l'indice per accedere al valore corretto
// Chiamata al servizio per effettuare l'acquisto
//Errore 401 utente non loggato e viene mostarto messaggio e viene rimandato alogin se vuole

PurchaseT(){
let k = <Flight_s>this.flight_t;
let i=0;
for (let elem of Object.keys(k.prices)) {
  if (elem === this.biglietto_d.type) {
    this.biglietto_d.cost =Object.values(k.prices)[i];
  }
  ++i;
}
this.biglietto_d.Date=k.date;
this.biglietto_d.DepartureTime=k.departureTime;
this
this.service.PurchaseT(k.id,this.biglietto_d,this.token).subscribe({
next: data => {
      this.risposta = data.message; // Mostro messaggio ricevuto 
      this.Flights=this.Flights.filter((x)=>x.id!=this.flight_t.id);
      this.Flights.push(data.flight_p);
      this.Tickets.push(data.biglietto);
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0,this.biglietto_d={n:0,type:'',extra_b:false,cost:0,DepartureTime:'',Date:'',route:{from:'',to:''}}}, 4000); // Dopo 3 secondi nascondo il messaggio
    },

 // Se c’è un errore
    error: err => {
      if(err.status==401){this.message="Non puoi procedere con l'acquisto non essendo loggato";this.risposta="Errore ,Utente non Loggato "}
      else{this.risposta=err.error.message;}
        this.res.Neg = 1; // Attivo flag Negativo 
        setTimeout(() => { this.res.Neg = 0,this.biglietto_d={n:0,type:'',extra_b:false,cost:0,DepartureTime:'',Date:'',route:{from:'',to:''}}}, 4000); // Mostro l’errore per 3 secondi

      }
         




})

this.acquista_b=false;



}




/*************************************  setta la var filtra_b a t/f in base l'utente vuole filtrare i voli o no */

Filtra_b(){
  this.filtra_b=!this.filtra_b;
}



/************************************* Itera su Flights in base all'input dell'utente (filtra per Prezzo)*/

FiltraPrezzo(){
  this.Flights=this.fs;
this.Flights=this.Flights.filter((x:Flight_s)=>x.prices.firstclass<=this.range_price||x.prices.business<=this.range_price||x.prices.economy<=this.range_price);
  this.Set_boo(this.Flights.length)

}


/************************************* Itera su Flights in base all'input dell'utente (filtra per Durata)*/

FiltraDurata(){

  this.Flights=this.Flights.filter((x:Flight_s)=>parseInt(x.flightTime.split(':')[0],10)<=this.range_duration);
    this.Set_boo(this.Flights.length)
}


/************************************* Itera su Flights in base all'input dell'utente (filtra per scalo)*/


Scalo(){
  if(this.scalo!=false)this.Flights=this.Flights.filter((x:Flight_s)=>x.stop>1);
  this.Set_boo(this.Flights.length)
  
}




/************************************* Copia il volo che l'utente vuole acquistare*/

Acquista_b(flight:Flight_s){
this.flight_t=<Flight_s>flight;
  this.acquista_b=true;//mostra div acquisti
}



/************************************* Controlla che l'utente non lasci i campi della ricerca vuoti */

// Faccio un ciclo su ogni elemento dell'array
// Se trovo un elemento vuoto (stringa ''), imposto f su true
// Ritorno f: sarà true solo se l'ultimo elemento dell'array è vuoto

UndefinedEl(array:string[]):boolean{
  let f=false ;
for(let el of array){
  f=el==''
}
return f;
}


/************************************* Mostra Messaggio se ho un Volo che rispecchia i Filtri */

 // Se n è uguale a 0, allora imposto risultato_bo su true (mostro  un messaggio)
  // Dopo 3 secondi (3000 ms), imposto risultato_bo su false (nascondo il messaggio)

Set_boo(n: number) {
  if (n == 0){this.risultato_bo = true};
  setTimeout(() => this.risultato_bo = false, 3000);
}



/************************************* Torna alla Login Page */

Login(){
  this.router.navigate(["/login"]);
}


MostraT(){
  this.bool_t=!this.bool_t;
}




/*************************************Inizializzazione Pagina */

// Controllo se nel localStorage c'è il token (jwt)
// Decodifico il token per leggere le info che contiene
// Prendo il nome utente dal token e lo salvo nella variabile name
// Prendo i biglietti dell'utente dal token e li salvo nella variabile Tickets
//copio il token e poi lo elimino dal local storage
// Se il token non c'è, allora l'utente non è loggato

ngOnInit(){
if(localStorage.getItem("jwt")!=undefined){
  let t=<Token>jwtDecode(<string>localStorage.getItem("jwt"));
  this.token=<string>localStorage.getItem("jwt");
  this.name=t.username;
  this.Tickets=t.Tickets;
   localStorage.removeItem("jwt");
}
else this.Notlogged=true;
  
}
}
