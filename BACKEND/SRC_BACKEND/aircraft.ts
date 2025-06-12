import { Rotta, Sic_T, User } from './express';
import express, { Router } from 'express';
import { Route_I, Flight_I, Aircraft_I, Users_DB } from "./UserDb";
const Rotta_a = express.Router();


                                                      //AIRCRAFT
                                                      


                                          //POST /AIRCRAFT
/************************************************************************************************************/

// Route per la creazione di un nuovo aircraft associato alla compagnia aerea autenticata
// Verifica che l’utente abbia il ruolo “Airline” e che l’aircraft non esista già nel database


Rotta_a.post("/aircraft", Sic_T, (req, res) => {
    let company = <User>req.user;
    let aircraft=req.body.aircraft;
    if (company.role == "Airline") {
        Users_DB.findOne( { email: company.email } )
            .then((user) => {
               if(user?.Aircrafts.find((x)=>x.id==aircraft.id))res.status(409).json({ message: "Aircraft già Presente" })
               else {
                Users_DB.findOneAndUpdate({email:company.email},{$push: {Aircrafts: aircraft }},{new:true})
                .then((user)=>{
                    if(user!=null)res.status(201).json({message:"Aircraft Creato",aircraft:aircraft})
                        else res.status(404).json({ message: "Errore nel salvataggio dell'Aircraft" })
                })
                .catch((err)=>{
                    res.status(505).json({ message: "Errore interno durante la creazione dell'aircraft" })
                })
               }
            })

        .catch ((err) => {
            res.status(505).json({ message: "Errore interno durante la ricerca dell'utente" });
        })
    }
    else res.status(401).json({ message: "Accesso negato" });
})



                                                //DELETE /AIRCRAFT/:ID
/*******************************************************************************/

// Route per la cancellazione di un aircraft associato alla compagnia aerea autenticata
// Verifica che l’utente abbia il ruolo “Airline” e cancella l'aircraft in base all'id di quest'ultimo

Rotta_a.delete("/aircraft/:id",Sic_T,(req,res)=>{
 let company=<User>req.user;
 let flights:Flight_I[]=[];
    if(company.role=="Airline"){
Users_DB.findOneAndUpdate(
  { email: company.email },
  { $pull: { Aircrafts: { id: parseInt(req.params.id) } }})
        .then((user)=>{
            if(user!=null){
              flights=user.DeleteF1(undefined,parseInt(req.params.id))
              user.save()
              .then((user)=>{
               res.json({message:"Aircraft Deleted e voli associati",Flights:flights})
              })
              .catch(()=>res.status(500).json({message:"Errore Interno nella rimozione del Volo associato all'aircraft"}))
            }
            else res.status(404).json({ message: "Utente non trovato" })
        })
        .catch(()=>res.status(500).json({ message: "Errore interno durante l'eliminazione dell'aereo" }))


    }
   else res.status(401).json({ message: "Accesso negato" })

})


                                            //GET /AIRCRAFT
/**************************************************************************************************/

// Route per ottenere tutti gli aircraft  associati alla compagnia aerea autenticata
// Verifica che l’utente abbia ruolo “Airline” e recupera la lista degli aircraft dal database
// Gestisce eventuali errori di accesso, ricerca o assenza dell’utente

Rotta_a.get("/aircrafts",Sic_T,(req,res)=>{
let company=<User>req.user;
if(company.role=="Airline"){
    Users_DB.findOne({email:company.email})
    .then((user)=>{
      if(user!=null)  res.send(user?.Aircrafts)
        else res.status(404).json({ message: "Utente non trovato" })
    })
    .catch(()=>{
      res.status(500).json({ message: "Errore interno durante l'eliminazione dell'aereo" });
    })
}
else res.status(401).json({ message: "Accesso negato" })

})


                                            //PUT /AIRCRAFT/:ID
/***********************************************************************************************/
// Route per aggiornare i dati di un aereo specifico associato a una compagnia aerea
// Controlla che l’utente sia un’“Airline” e utilizza un metodo ----> UpdateA()  dell’utente per aggiornare l’aereo
// Gestisce errori durante la ricerca dell’utente o il salvataggio dell’aggiornamento

Rotta_a.put("/aircraft/:id", Sic_T, (req, res) => {
  let company = <User>req.user;
  let aircraft:Aircraft_I=req.body.aircraft;
    if (company.role === "Airline") {
    Users_DB.findOne({ email: company.email })
      .then((user) => {
        if(user==null)res.status(404).json({ message: "Utente non trovato" })
          else{
            user.UpdateA(aircraft);
            user.save()
            .then((user)=>{
              res.json({message:"Aircraft Updated",aircraft:user.Aircrafts.find((x)=>x.id==aircraft.id)})
            })
            .catch(()=>{
              res.status(500).json({ message: "Errore durante aggiornamento dell'Aircraft" })
            })
        }
      })
      .catch(()=>{
        res.status(500).json({message:"Errore Interno nella ricerca dell'Utente"})
      })
    }
    else res.status(401).json({message:"Accesso Negato"})
  }
)






export{Rotta_a}