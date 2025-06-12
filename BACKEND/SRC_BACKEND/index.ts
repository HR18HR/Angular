import express from 'express'
import http from 'http';
import cors from 'cors';
import { config } from 'dotenv';
import {Rotta}from './express'; //ROTTA USATA PER LA GESTIONE TUTTO CIO' CHE RIGUARDA GLI UTENTI (LOGIN REGISTRAZIONE E INFO)
import {mongoose}from './UserDb';
import { Users_DB} from './UserDb'; //DB
import { Rotta_r } from './route';  //ROTTA CHE GESTISCE LA ROUTE 
import { Rotta_a } from './aircraft'; //ROTTA CHE GESTISCE GLI AIRCRAFT
import { Rotta_f } from './flights'; //ROTTA CHE GESTISCE I FLIGHTS
import { Rotta_s } from './search';   //ROTTA CHE GESTISCE RICERCA VOLI


const app=express(); //Creazione server con express
const server=http.createServer(app);  //  

app.use(cors());
app.use(express.json())
app.use("",Rotta);
app.use("",Rotta_r)
app.use("",Rotta_a)
app.use("",Rotta_f)
app.use("",Rotta_s)

config(); //CCONFIG PER CARICA VARIABILI DA .ENV



//INIZIALIZZAZIONE DB MONGO DB E SEVER IN PORTA 3000 SU LOCALHOST O   0.0.0.0  QUESTO  PER RENDERE IL SERVER RAGGIUNGIBILE DALL'ESTERNO 
if(process.env.MONGO!=undefined){
mongoose.connect(process.env.MONGO).then(()=>{
server.listen(3000,"0.0.0.0",()=>{
    console.log("SONO ATTIVO")
    Users_DB.countDocuments().then((numero_d)=>{
      if(numero_d==0){
        CreateU();
        console.log("Utenti Creati")
      }
      else{
        console.log("DB già occupato")
        }
      })

    })


})
.catch((err)=>{
  console.log(err);

})
}

let CreateU=function(){
    const Admin= new Users_DB({
      email:"admin",
      username:"admin",
      role:"Admin"
    })
    Admin.setPassword("1234");
    Admin.save()
    .then((user)=>{
      if(user!=null){
      const newAirline = new Users_DB({
      username: "fly",
      email: "fly.com",
      role: "Airline",
      firstTime: true,
      Routes: [
        {
          from: "ROMA",
          to: "PARIGI",
          views: 0,
          id: 1,
        }
      ],
      Aircrafts: [
        {
          id: 1,
          model: "Boeing",
          capacity: {
            firstclass: 10,
            business: 20,
            economy: 100,
          },
        },
      ],
      Flights: [
        {
          id: "F001",
          route: { from: "ROMA", to: "PARIGI" },
          aircraft: 1,
          date: "2025-06-02", // tutti i voli lo stesso giorno
          departureTime: "08:00",
          flightTime: "02:00",
          stop: 0,
          state: "OnTime",
          owner: "fly",
          prices: {
            firstclass: 300,
            business: 200,
            economy: 100,
          },
          seats_available: {
            firstclass: { Num: 10, type: "firstclass" },
            business: { Num: 20, type: "business" },
            economy: { Num: 100, type: "economy" },
          },
          revenue: 0,
          Passengers: [],
        },
        {
          id: "F002",
          route: { from: "ROMA", to: "PARIGI" },
          aircraft: 1,
          date: "2025-06-02",
          departureTime: "13:00",
          flightTime: "01:30",
          stop: 0,
          state: "OnTime",
          owner: "fly",
          prices: {
            firstclass: 320,
            business: 220,
            economy: 120,
          },
          seats_available: {
            firstclass: { Num: 10, type: "firstclass" },
            business: { Num: 20, type: "business" },
            economy: { Num: 100, type: "economy" },
          },
          revenue: 0,
          Passengers: [],
        }
      ],
    });

    // Setto una password per l'utente
    newAirline.setPassword("1234")
    newAirline.save()
    .then((user)=>{if(user==null)console.log("Airline Non Creata")})
      .catch((err)=>{console.log("Errore Interno--->",err)})
  }
  else{
    console.log("Admin Non Creato")
  }
   })
   .catch((err)=>{console.log("Errore Interno--->",err)})
}