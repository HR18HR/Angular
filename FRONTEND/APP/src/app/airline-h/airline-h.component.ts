import { Component,AfterViewInit,OnInit,AfterViewChecked} from '@angular/core';
import { Aircraft_I, FlightService } from '../flight.service';
import { jwtDecode} from 'jwt-decode';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Userservice,Token } from '../User.service';
import { Route_I,Flight_I } from '../flight.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-airline-h',
  imports: [FormsModule,NgIf,NgFor,DatePipe],
  templateUrl: './airline-h.component.html',
  styleUrl: './airline-h.component.css'
})
export class AirlineHComponent{
/**************************************** */ /**VARIABILI UPDATE DATI*/

token:string='';

first_T:Boolean=false; // booleano per sapere se è il primo loggin dell'utente 
Updating:{email:string,username:string,password:string}={email:'',username:'',password:''}; //biding variabili per cambiare i dati utente 



/**************************************** */ /**VARIABILI ROTTA */
rotta:Route_I={from:'',to:'',id:0,views:0}; //biding input da mandare in post
risposta:string=''; //risposta inviata dal backend
res:{Pos:number,Neg:number}={Pos:0,Neg:0} // oggetto per mostrare il div in  base al meseaggio
Rotte:Route_I[]=[]; //Route o rotte ricevute  dal backend
rottatc:any; //rotta appoggio 
bool_r:boolean=false; //booleano per mostrare il div che modifica la rotta
rottaup:Route_I={from:'',to:'',id:0,views:0}; //biding rotta da mandare in put  cioè modificata
id:number=0; //id rotta 
visual_r:boolean=true; //mostrare il div o no delle rotte



/**************************************** */ /**VARIABILI AIRCRAFT */
aircraft:Aircraft_I={id:0,model:'Boeing',capacity:{firstclass:0,business:0,economy:0}};//biding input da mandare in post
Aircrafts:Aircraft_I[]=[];//Aircraft o rotte ricevute  dal backend
aircraftup:Aircraft_I={id:0,model:"Boeing",capacity:{firstclass:0,business:0,economy:0}} //biding aircraft  da mandare in put cioè modificata 
aircrafttc:any;  //aircraft appoggio 
bool_a:boolean=false; //booleano per mostrare il div che modifica laaircraft

visual_a:boolean=true; //mostrare il div o no delle aircraft



/**************************************** */ /**VARIABILI FLIGHT */
flight:Flight_I
  ={id: '',route:{from: '',to: ''},aircraft:0,date: '', departureTime: '', flightTime: '',stop: 0,
  prices: { firstclass: 0, business: 0, economy: 0, },Passengers:[],revenue:0,state:'OnTime',owner:'',
  seats_available:{
   firstclass: { Num: 0, type: "firstclass" },
   business: { Num:0, type: "business" },
  economy: { Num: 0, type: "economy" },
   },}  //biding flight da inviare in  post su mongo

Flights:Flight_I[]=[]; //voli ricevuti / creati 
flightc:any;// voli ricevuti 
cr_f:boolean=false;// booleano per mostare il div che manda richiesta crea
visual_f:boolean=true; //mostrare il div o no dei aflight
bool_f:boolean=false //mostra div dei flights o no 


constructor(public U_S:Userservice,public F_S:FlightService,public Router:Router){}




                         //Update dei dati come -->email,username e password
/************************************************************************************************************/

Update(){
  this.U_S.Update(this.Updating.email,this.Updating.password,this.Updating.username,this.token).subscribe({
    next: data => {
      this.risposta = data.message; // Mostro messaggio ricevuto 
      this.res.Pos = 1; // Attivo flag positivo
      this.first_T=false;
      this.Router.navigate(['/login']);
      setTimeout(() => { this.res.Pos = 0}, 5000); // Dopo 3 secondi nascondo il messaggio
    },

    // Se c’è un errore
    error: err => {
      this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi

      }
         

  })
}
                                    //Crea Rotta
/************************************************************************************************************/
// Funzione per creare rotta
//controlla che i campi non siano vuoti 
//passa i datai da inviare insieme al token al servizio

CreateRotta() {
  // Controllo preliminare sulla lunghezza dell'id: deve essere almeno 3 caratteri
  if (this.rotta.id.toString().length < 3) {
    alert("id rotta deve avere una lunghezza almeno pari a 3");
  } 
  
  else if(this.rotta.from==''||this.rotta.to==''||this.rotta.from==''&&this.rotta.to=='') alert("Non puoi lasciare Campi Partenza e Arrivo Vuoti");
  else {
    this.rotta.from= this.rotta.from.toUpperCase();
    this.rotta.to= this.rotta.to.toUpperCase();
    // Chiamo il servizio per creare una nuova rotta
    this.F_S.CreateRotta(this.rotta,this.token).subscribe({
      
      // In caso di risposta positiva (rotta creata con successo)
      next: data => {
        this.risposta = data.message;          // Mostro il messaggio ricevuto dal server
        this.Rotte.push(data.rotta);           // Aggiungo la nuova rotta alla lista delle rotte
        this.res.Pos = 1;                      // Attivo il flag per messaggio positivo

        // Dopo 3 secondi nascondo il messaggio e resetto i campi del form
        setTimeout(() => {
          this.res.Pos = 0;
          this.rotta = { from: '', to: '', id: 0 ,views:0};
        }, 3000);
      },

      // Gestione degli errori restituiti dal server
      error: err => {
      this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
    });
  }
  this.cr_f=false;
}


                                      //Update rotta
/************************************************************************************************************/
//Funzione che Modifica Una Route
//Controlla che l'utente non lasci i campi from e to vuoti 
//Mette tutto in upperCase e poi passa l'oggetto Route al servizio insieme al token

UpdateRotta(){
  if(this.rottaup.from==''&&this.rottaup.to==''||this.rottaup.from==''||this.rottaup.to=='')alert("NON PUOI LASCIARE I CAMPI PARTENZA E ARRIVOVUOTI")
  else{
    this.rottaup.id=this.rottatc.id;
    this.rottaup.from=this.rottaup.from.toUpperCase();
    this.rottaup.to=this.rottaup.to.toUpperCase();
    this.F_S.UpdateRotta(this.rottaup.id.toString(),this.rottaup,this.token).subscribe({
      next:data=> {
        this.risposta = data.message; // Mostro messaggio ricevuto 
        this.Rotte=this.Rotte.filter((x)=>x.id!=this.rottaup.id)
        this.Rotte.push(data.rotta)
        this.res.Pos = 1; // Attivo flag positivo
        setTimeout(() => { this.res.Pos = 0,this.rottaup = { id: 0, from: '', to: '' ,  views:0};}, 2000); // Dopo 3 secondi nascondo il messaggio
      },
       error: err => {
        this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
  
    })
    this.bool_r=false;
}
}

                                    //DeleteRoute
/************************************************************************************************************/
// Funzione che ottiene  Elimina una Rouet  dal DB

DeleteRoute(id:number){
this.F_S.DeleteRoute(id.toString(),this.token).subscribe({
  next: data => {
      this.risposta = data.message;
      this.Rotte=this.Rotte.filter((x)=>x.id!=id)
      this.Flights=data.flights;
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    error: err => {
        this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
   

  })
}


                                    //GetRoutes
/************************************************************************************************************/
// Funzione che ottiene le rotte 
GetRotte(){
  this.F_S.GetRotte(this.token).subscribe({
    next: data => {
      this.risposta="ECCO LE ROTTE"
      this.Rotte=data;
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    error: err => {
      this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
   


  })
}

                                            //Crea Aircraft
/************************************************************************************************************/
//Funzione che crea un Aircrafts usando il servizio che prende un id e la capacita dell'aircraft


CreateAircraft() {
  // Controllo preliminare sulla lunghezza dell'id: deve essere almeno 3 caratteri
  if (this.aircraft.id.toString().length < 3) {
    alert("id aircraft deve avere una lunghezza almeno pari a 3");
  } 
  
  else {
    // Chiamo il servizio per creare una nuova rotta
    this.F_S.CreateAircraft(this.aircraft,this.token).subscribe({
      
      // In caso di risposta positiva (rotta creata con successo)
      next: data => {
        this.risposta = data.message;          // Mostro il messaggio ricevuto dal server
        this.Aircrafts.push(data.aircraft);           // Aggiungo la nuova rotta alla lista delle rotte
        this.res.Pos = 1;                      // Attivo il flag per messaggio positivo

        // Dopo 3 secondi nascondo il messaggio e resetto i campi del form
        setTimeout(() => {
          this.res.Pos = 0;
          this.aircraft = { id:0,model:"Boeing",capacity:{firstclass:0,business:0,economy:0}};
        }, 3000);
      },

      // Gestione degli errori restituiti dal server
      error: err => {
         this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
    });
  }
}


                                    //GetAircrafts
/*******************************************************************************************************/
//Fuzniomne che ottiene un array di Aircrafts dal DB
GetAircrafts(){
  this.F_S.GetAircrafts(this.token).subscribe({
    next: data => {
      this.risposta="ECCO GLI AIRCRAFTS"
      this.Aircrafts=data;
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    error: err => {
       this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
   


  })
}




                                    //DeleteAircraft
/************************************************************************************************************/
//Funzione che elimina un aircraft dal Db in base all'id dell'Aircraft 

DeleteAircraft(id:number){
this.F_S.DeleteAircraft(id.toString(),this.token).subscribe({
  next: data => {
      this.risposta = data.message;
      this.Aircrafts=this.Aircrafts.filter((x)=>x.id!=id)
      this.Flights=data.Flights;
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    error: err => {
       this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
   

  })
}



                                      //Update aircraft
/************************************************************************************************************/
//Funzione che modifica un aircraft nel DB
//Passa il token e l'ogetto aircraft modificato ,utente puo modificare solo la capacità



UpdateAircraft(){
    this.aircraftup.id=this.aircrafttc.id;
    this.F_S.UpdateAircraft(this.aircraftup.id.toString(),this.aircraftup,this.token).subscribe({
      next:data=> {
        this.risposta = data.message; // Mostro messaggio ricevuto 
        this.Aircrafts=this.Aircrafts.filter((x)=>x.id!=this.aircraftup.id)
        this.Aircrafts.push(data.aircraft)
        this.res.Pos = 1; // Attivo flag positivo
        setTimeout(() => { this.res.Pos = 0,this.aircraftup = { id: 0,model:"Boeing",capacity:{firstclass:0,business:0,economy:0}}}, 5000); // Dopo 3 secondi nascondo il messaggio
      },
       error: err => {
       this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => {
          this.res.Neg = 0;
          this.aircraftup={id:0,model:"Boeing",capacity:{firstclass:0,business:0,economy:0}}
        }, 3000);  // Mostro il messaggio di errore per 3 secondi
      }
  
    })
    this.bool_a=false;
  }



                                      //Create Flight
/***********************************************************************************************/
//Funzione che Crea un Volo nel DB
//Controlla che l'id sia presente e lo stop o lo scalo sia inferiore o uguale a 2
//mette in upperCase il from e to e poi passa l'oggetto al servizio con il token


CreateFlight() {
    if(this.flight.id=='')alert("Id non  puo essere vuoto");
    else if(this.flight.stop>2)alert("Lo scalo non puo essere maggiore di 2");
    else{
    // Chiamo il servizio per creare una nuova rotta
    this.flight.route.from=this.flight.route.from.toUpperCase();
    this.flight.route.to=this.flight.route.to.toUpperCase();
    this.F_S.CreateFlight(this.flight,this.token).subscribe({
      
      // In caso di risposta positiva (rotta creata con successo)
      next: data => {
        this.risposta = data.message;          // Mostro il messaggio ricevuto dal server
        this.Flights.push(data.flight)         // Aggiungo la nuova rotta alla lista delle rotte
        this.res.Pos = 1;                      // Attivo il flag per messaggio positivo

        // Dopo 3 secondi nascondo il messaggio e resetto i campi del form
        setTimeout(() => {
          this.res.Pos = 0;
        }, 3000);
      },

      // Gestione degli errori restituiti dal server
      error: err => {
      this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 3000); // Mostro l’errore per 2 secondi
      }
    });
    setTimeout(()=>this.flight={id: '',route:{from: '',to: ''},aircraft:0,date: '', departureTime: '', flightTime: '',stop: 0,
  prices: { firstclass: 0, business: 0, economy: 0, },Passengers:[],revenue:0,state:'OnTime',owner:'',
  seats_available:{
   firstclass: { Num: 0, type: "firstclass" },
   business: { Num:0, type: "business" },
  economy: { Num: 0, type: "economy" },
   },},3000)
    this.cr_f=false;
  }
}


                                    //GetFlights
/*******************************************************************************************************/
 
//Funzione che ottiene tutti i Voli per una certa Compagnia di Volo 

GetFlights(){
  this.F_S.GetFlights(this.token).subscribe({
    next: data => {
      this.risposta="ECCO  I VOLI "
      this.Flights=data;
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    error: err => {
      this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
   

  })
}

                                              //DeleteFlight
/************************************************************************************************************/

//Funzione che Elimina un volo dal DB  in base all'id del volo che viene passato al servizio

DeleteFlight(id:string){
this.F_S.DeleteFlight(id,this.token).subscribe({
  next: data => {
      this.risposta = data.message;
      this.Flights=this.Flights.filter((x)=>x.id!=id)
      this.res.Pos = 1; // Attivo flag positivo
      setTimeout(() => { this.res.Pos = 0}, 3000); // Dopo 3 secondi nascondo il messaggio
    },

    error: err => {
       this.risposta=err.error.message;
        this.res.Neg = 1;
        setTimeout(() => { this.res.Neg = 0 }, 2000); // Mostro l’errore per 2 secondi
      }
   

  })
}




                                              //UpdateFlight
/************************************************************************************************************/
// Metodo per aggiornare i dati del volo corrente (flightc) con quelli modificati (flight_up),
// invia la richiesta di aggiornamento tramite il servizio F_S.UpdateFlight.
// Se la richiesta ha successo, aggiorna la lista dei voli sostituendo il volo aggiornato,
// mostra un messaggio di successo e resetta i dati temporanei dopo 4 secondi.
// In caso di errore, mostra il messaggio di errore appropriato e resetta i dati temporanei.
// Alla fine chiude la vista di modifica impostando bool_f a false.
UpdateFlight() {
  if(this.flightc.stop>2)alert("Lo scalo non puo essere maggiore di 2");
  else{
    this.flightc.route.from=this.flightc.route.from.toUpperCase();
    this.flightc.route.to=this.flightc.route.to.toUpperCase();
  this.F_S.UpdateFlight(this.flightc.id, <Flight_I>this.flightc,this.token).subscribe({
    next: data => {
      this.risposta = data.message;
      this.Flights = this.Flights.filter((x) => x.id !=this.flightc.id);
      this.Flights.push(data.flight);
      this.res.Pos = 1; // Attiva il flag di risposta positiva
      setTimeout(() => {
        this.res.Pos = 0;
      }, 2000);
    },
    error: err => {
      this.risposta=err.error.message;
      this.res.Neg = 1; // Attiva il flag di risposta negativa
      setTimeout(() => {
        this.res.Pos = 0;
      },3000);
    }
  });

  this.bool_f = false; // Nasconde la vista di modifica
}
}



/****************************************************************************** */

// funzione toglie dalla vista le routes creati o ricevuti 
// funzioni che permettono di mostrare un div o No in base al NgIF 
//la prima attiva il div per la modifica della rotta e copia la route che verrà modificato 
//Anche il secondo..però non prende nessun parametro


RemoveVisual_r(){
  this.visual_r=!this.visual_r;
}


BOO_r(rotta:Route_I){
this.bool_r=!this.bool_r;
this.rottatc=rotta;
  
}
BOO_r1(){
this.bool_r=!this.bool_r;
  
}
/********************************************************************** */
// funzione toglie dalla vista gli aircraft creati o ricevuti 
// funzioni che permettono di mostrare un div o No in base al NgIF 
//la prima attiva il div per la modifica aircraft e la copia l'aircraft che verrà modificato 
//Anche il secondo..però non prende nessun parametro


RemoveVisual_a(){
  this.visual_a=!this.visual_a;
}


BOO_a(aircraft:Aircraft_I){
this.bool_a=!this.bool_a;
this.aircrafttc=aircraft;
  
}
BOO_a1(){
this.bool_a=!this.bool_a;
  
}

/***************************************************************************** */
// Sono funzioni che permettono di mostrare un div o No in base al NgIF 
//la prima attiva il div per la modifica Volo e copia il Volo che verrà modificato 
//ANche il secondo però non prende nessun parametro
//l'ultima funzione toglie dalla vista I voli creati o ricevuti 

BOO_f(flight:Flight_I){
  if(flight!=undefined)this.flightc=flight;
  this.bool_f=!this.bool_f;
}
BOO_f1(){
  this.bool_f=!this.bool_f;
}


RemoveVisual_f(){
  this.visual_f=!this.visual_f;
}


/************************************************************    Cr_F ******************/

//Funzione che permette di nascondere o no il div per creare il Flight, corrisponde all buttone X
Cr_F(){
  this.cr_f=!this.cr_f;
}



ngOnInit(){
if(localStorage.getItem("jwt")!=null){
  let t=<Token>jwtDecode(<string>localStorage.getItem("jwt"));
  this.token=<string>localStorage.getItem("jwt");
  this.first_T=t.firstTime
  localStorage.removeItem("jwt");
}else console.log("jwt non trovato");
  
}

}
