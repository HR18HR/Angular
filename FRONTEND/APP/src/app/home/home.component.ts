import { Component,numberAttribute,OnInit,AfterViewInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, Userservice } from '../User.service';
import { NgFor, NgIf } from '@angular/common';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-home',
  imports: [FormsModule,NgIf,NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HOMEComponent {
  token:string='';
  username: string = "";  // Username inserito dall’utente per cercare un utente specifico
  Airline: User = { email: '', password: '', username: '',};  // Oggetto User da compilare per registrare una nuova compagnia aerea
  risposta: string = '';  // Messaggio da visualizzare all’utente 
  res: { Pos: number, Neg: number } = { Pos: 0, Neg: 0 }; //  booleani sotto forma numerica per mostrare successi o errori
  Users: User[] = [];  // Lista di utenti ricevuti 




  // Inietto il servizio che si occupa delle chiamate HTTP
  constructor(public Servizio: Userservice) {}


/*********************************************    Registra_Airline  ********************************************* */

  // Funzione per registrare una nuova compagnia aerea
  Registra_Airline() {
    this.Servizio.REGIST_Airline(
      this.Airline.email,
      <string>this.Airline.password,
      this.Airline.username,this.token
    ).subscribe({

      // In caso di successo, mostro messaggio e flag positivo
      next: data => {
        this.risposta =data.message;
        this.res.Pos = 1;
        setTimeout(() => { this.res.Pos = 0 ;
          this.Airline.email='';
          this.Airline.username='';
          this.Airline.password='';
        }, 3000); // Messaggio scompare dopo 3 secondi
      },

      // In caso di errore
      error: err => {
        this.risposta=err.error.message;
        this.res.Neg = 1;
          setTimeout(() => { this.res.Neg = 0 }, 2000);
      }
    })
  }


/*********************************************  GiveOne()  ********************************************* */

 // Funzione per cercare un utente tramite username  o avere tutti gli user
 //Funzione che passa al servizio l'username dell'User e il token
 //Riceve o un array di User o un User a seconda se l'utente ha inserito l'username o lo ha lasciato vuoto

 
  GiveOne() {
    this.Servizio.GiveOne(this.username,this.token).subscribe({

      // Se trovato, lo aggiungo alla lista Users
      next: data => { 
      if(data instanceof Array)this.Users=data;
      else this.Users.push(data)

      },

      // Se c'è un errore, gestisco i messaggi in base allo status
      error: err => {
        this.risposta=err.error.message;
        this.res.Neg = 1;
          setTimeout(() => { this.res.Neg = 0 }, 2000);
      }
    })
  }


/*********************************************    DeleteOne    ********************************************* */

   // Funzione per eliminare un utente specificato dal DB
   //Prende come parametro un oggetto User e poi estrae l'username e lo passa al servizio con il token;

  DeleteOne(user: User) {
    this.Servizio.DeleteOne(user.username,this.token).subscribe({

      // In caso di successo, mostro messaggio e attivo flag positivo
      next: data => {
        this.risposta = data.message;
        this.res.Pos = 1;
       this.Users = this.Users.filter(u => u != user)
        setTimeout(() => { this.res.Pos = 0 }, 3000);
      },

      // In caso di errore → gestisco status
      error: err => {
        this.risposta=err.error.message;
          this.res.Neg = 1;
          setTimeout(() => { this.res.Neg = 0 }, 2000);
      }
    })
  }


  /********************************************  Visual_Rem  *********************************** */

  //Elimino l'user dall'array Users
  //Funzione che elimina utente dall visuale ma non dal DB.

Visual_Rem(user:User){
  this.Users = this.Users.filter(u => u != user)
}

ngOnInit(){
  if(localStorage.getItem("jwt")!=undefined){
    this.token=<string>localStorage.getItem("jwt");
     localStorage.removeItem("jwt");
  }
  else alert("Nessun Token trovato");
}
}
