import { Component } from '@angular/core';
import { Userservice } from '../User.service'; 
import { FormsModule } from '@angular/forms';
import { error } from 'console';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-registrazione',
  imports: [FormsModule,NgIf],
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.css'
})
export class RegistrazioneComponent {

  email: string = '';     // Campo legato all’input dell’email nel form
  username: string = '';  // Campo per lo username
  password: string = '';  // Campo per la password
  risposta: string = '';  // Messaggio di conferma o errore da mostrare all’utente
  res: { Pos: number, Neg: number } = { Pos: 0, Neg: 0 }; // Oggetto per gestire flag visivi di successo (Pos) o fallimento (Neg)



  // Costruttore con due dipendenze:
  // - UserH: il servizio Userservice che ha la logica per registrarsi
  // - Router: per cambiare rotta (navigare)
  constructor(public UserH: Userservice, public Router: Router) {}



  // Funzione chiamata quando l’utente preme "Registrati"
  Regist() {
    // Chiamo il metodo REGIST del servizio, passando email, password e username
    this.UserH.REGIST(this.email, this.password, this.username).subscribe({

      // Se la registrazione va a buon fine
      next: data => {
        this.risposta = data.message // Mostro messaggio ricevuto 
        this.res.Pos = 1; // Attivo flag positivo
        this.Router.navigate(["/login"]); // Reindirizzo alla pagina di login
        setTimeout(() => { this.res.Pos = 0 }, 3000); // Dopo 3 secondi nascondo il messaggio
      },

      // Se c’è un errore
      error: err => {
          this.risposta = err.error.message; //Mostro messaggio errore ricevuto
          this.res.Neg = 1;
          setTimeout(() => { this.res.Neg = 0 }, 3000); // Dopo 3 secondi nascondo il messaggio
        }

    })
  }




}
