import { Rotta, Sic_T, User } from './express';
import express, { Router } from 'express';
import { Route_I, Flight_I, Aircraft_I, Users_DB } from "./UserDb";
import { RESERVED_EVENTS } from 'socket.io/dist/socket-types';
const Rotta_f = express.Router();




                                          //FLIGHT




/************************************************************************************************************/
                          //CREAZIONE FLIGHT CON POST        /FLIGHT
//ho deciso di inviare l'ogetto fligHt da creare nel body e di creare uno da capo che avrà delle proprità non inserite nel lato client
//controlla che l'id flight non sia usato a livello globale
//conrolla che le rotte inserite e l'aircraft usato siano persenti 

Rotta_f.post("/flight", Sic_T, (req, res) => {
  let company = <User>req.user;
  let flight =<Flight_I>req.body.flight;
if(company.role=="Airline"){
  Users_DB.find({ "Flights.id": flight.id })
    .then((user) => {
      if (user.length >= 1) res.status(409).json({message:"ID gia Usato "});
      else {
        Users_DB.findOne({ email: company.email })
          .then((user) => {
            if (user == null) res.status(404).json({message:'Utente non trovato'});
            else {
              if (
                user.Routes.find((x) => x.from == flight.route.from && x.to == flight.route.to) &&
                user.Aircrafts.find((x) => x.id == flight.aircraft)
              ) {
                let r = <Route_I>user.Routes.find((x) => x.from == flight.route.from && x.to == flight.route.to);
                let a =<Aircraft_I>user.Aircrafts.find((x) => x.id == flight.aircraft);
                let fli: Flight_I = {
                  id: <string>flight.id,
                  route:{from:r?.from,to:r?.to},
                  aircraft: <number>a?.id,
                  date:flight.date,
                  departureTime: flight.departureTime,
                  flightTime: <string>flight.flightTime,
                  stop: <number>flight.stop,
                  owner: user.username,
                  state:flight.state,
                  prices: {
                    firstclass: flight.prices.firstclass,
                    business: flight.prices.business,
                    economy: flight.prices.economy,
                  },
                  seats_available: {
                    firstclass: { Num: <number>a?.capacity.firstclass, type: "firstclass" },
                    business: { Num: <number>a?.capacity.business, type: "business" },
                    economy: { Num: <number>a?.capacity.economy, type: "economy" },
                  },
                  revenue: flight.revenue,
                  Passengers: flight.Passengers
                };

                Users_DB.findOneAndUpdate({ email: user.email }, { $push: { Flights: fli } })
                  .then((user) => {
                    res.status(201).json({message: "Flight Created",flight:fli});
                  })
                  .catch((err) => {
                    res.status(500).json({message:"Flight Non creato"});
                  });
              } else res.status(404).json({message:'Rotta o Aircraft non presenti nel DB '});
            }
          });
      }
    })
    .catch(() => {
      res.status(500).json({message:"Errore Interno nel Server"});
    });
}
else res.status(401).json({ message: "Accesso negato" })
});




                                                 // GET   /FLIGHT
/*****************************************************************************/
  // Route per ottenere tutti i voli associati alla compagnia aerea autenticata
// Cerca l’utente in base all’email, se trovato restituisce l’array Flights                           

Rotta_f.get("/flights",Sic_T,(req,res)=>{
  let company=<User>req.user;
  if(company.role=="Airline"){
    Users_DB.findOne({email:company.email})
    .then((user)=>{
      if(user==null)res.status(404).json({ message: "Utente non trovato" })
      else{
        res.status(200).send(user.Flights)
      }
    })
    .catch(()=>{
      res.status(500).json({ message: "Errore interno durante il recupero dei voli"})
    })

  }
  else res.status(401).json({ message: "Accesso negato" })
})


                                                //DELETE FLIGHT/:ID
/*************************************************************************/
// Route per eliminare un volo specifico associato alla compagnia aerea autenticata
// Usa $pull per rimuovere il volo dall’array Flights nel documento utente                        

Rotta_f.delete("/flight/:id",Sic_T,(req,res)=>{
 let company=<User>req.user;
    if(company.role=="Airline"){
Users_DB.findOneAndUpdate(
  { email: company.email },
  { $pull: { Flights: { id:req.params.id} }})
        .then((user)=>{
            if(user!=null){
         res.status(200).json({message:"Flight Deleted"})
            }
            else res.status(404).json({ message: "Utente non trovato" })
        })
        .catch((err)=>res.status(500).json({ message: "Errore interno durante la rimozione del volo esistente" }))


    }
   else res.status(401).json({ message: "Accesso negato" })

})
        
                                            // PUT  //FLIGHT/:ID
/*******************************************************************************************/
// Route per aggiornare un volo specifico associato alla compagnia aerea autenticata
// Cerca l’utente, aggiorna il volo tramite il metodo (UpdateF) e salva il documento
                     
Rotta_f.put("/flight/:id", Sic_T, (req, res) => {
  let company = <User>req.user;
  let flight_up = req.body.flight_up;//flight già aggiornato nel req.body è basterà fare push

  if (company.role === "Airline") {
    Users_DB.findOne({ email: company.email })
      .then(user => {
        if (user == null) {
          res.status(404).json({ message: "Utente non trovato" });
        } else {
          user.UpdateF(flight_up);
          user.save()
            .then(() => {
              res.status(200).json({ message: "Volo aggiornato con successo" ,flight:flight_up});
            })
            .catch(() => {
              res.status(500).json({ message: "Errore durante il salvataggio del volo" });
            });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Errore durante la ricerca dell'utente" });
      });
  } else {
    res.status(401).json({ message: "Accesso negato" });
  }
});



export{Rotta_f}