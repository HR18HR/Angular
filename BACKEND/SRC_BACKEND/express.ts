import express, { RequestHandler } from 'express'       //express
import passport from 'passport';    //passport
import j from 'jsonwebtoken'        //jwt per le sessioni
import {expressjwt}from 'express-jwt'; //creazione middleware di auth dei JWT
import { BasicStrategy } from 'passport-http'; //importazione della strategia basic per l'authenticazione 
import {Users_DB}from './UserDb';
import { config } from 'dotenv';
import { exit } from 'process';
config();
if(process.env.KEY==undefined)exit(-1);




//Interface User cioè la definzione dell'ogetto user che viene ritornato dai middleware di autenticazione del JWT o nella fase di login
interface User{
  email:string,
  username:string,
  role:string,
}




const Rotta = express.Router();            //ROTTA DEFENITA;


//MIDDLEWARE DI CHECK DELLA VALIDITA' DEL  JWT IN  ALCUNE ROTTE

 export const Sic_T= expressjwt({
  secret: process.env.KEY,
  algorithms: ['HS256'],
  requestProperty:"user",
});


//ROTTA per l'insermineto di un nuovo user nel DataBase e dunque la registrazione: ENDPOINT -> /registrazione

Rotta.post("/registrazione",(req,res)=>{
    Users_DB.create({email:req.body.email,username:req.body.username,role:"User"})
    .then((user)=>{
        user.setPassword(req.body.password);
        user.save();
       res.json({message:"Utente Creato"})
    })
    .catch((err)=>{
      res.status(409).json({message:"Errore durante la creazione del tuo profilo ,dati già in uso "});
    })
})


                                        //POST /REGISTRAZIONE/AIRLINE
/************************************************************************* */
//ROTTA REGISTRAZIONE AIRLINE
//DATI VENGONO PRESI DAL BODY DELLA REQUEST

Rotta.post("/registrazione/airline",Sic_T,(req,res)=>{
  let User=<User>req.user;
  if(User.role=="Admin"){
  Users_DB.create({email:req.body.email,username:req.body.username,role:"Airline",firstTime:true})
  .then((user)=>{
      user.setPassword(req.body.password);
      user.save();
     res.json({message:"Airline Creata"})
  })
  .catch((err)=>{
    res.status(409).json({message:"Errore durante la creazione della Airline,dati già in uso "});
  })
  }
  else{
    res.status(401).json({ message: "Accesso negato" });

  }
})

                                  //PUT /REGISTRAZIONE/AIRLINE
/**********************************************************************************/
//ROTTA MODIFICA DATI  AIRLINE 
//DATI VENGONO PRESI DAL BODY DELLA REQUEST

Rotta.put("/registrazione/airline",Sic_T,(req,res)=>{
  let User=<User>req.user;
  if(User.role=="Airline"){
  Users_DB.findOneAndUpdate({email:User.email},{email:req.body.email,username:req.body.username,firstTime:false})
  .then((user)=>{
    if(user!=null){
      user.setPassword(req.body.password);
      user.save();
     res.json({message:"Dati Aggiornati"})
    }
    else res.status(404).json({ message: "Utente non trovato" })
  })
  .catch((err)=>{
    res.status(409).json({message:"Errore durante l'aggiornamento dei dati,dati già in uso "});
  })
  }
  else{
    res.status(401).json({ message: "Accesso negato" });

  }
})





//ROTTA per l'autenticazione: Uso di basic senza sessione che verrà gestita dai jwt.: ENDPOINT -> /login
Rotta.post("/login", passport.authenticate('basic', { session: false }), (req, res) => {
  let user=<User>req.user
   Users_DB.findOne({email:user.email})
        .then((User) => {
            if(User!=null){
            let token = j.sign({email:User.email,username:User.username,role:User.role,firstTime:User.firstTime,Tickets:User.Tickets},<string>process.env.KEY, { expiresIn: '1d' });
            res.status(200).json({ toke: token, message: "Benvenuto" });}
            else res.status(500).json({message:User})
        })
        .catch((err)=>{
            res.status(500).json({ message: "Errore interno durante la ricerca dell'utente" })
        })
})

                                                //GET USER ?u=
/****************************************************************************************************** */
//ROTTA USATA DA ADMIN E QUINDI CHIUSA PER OTTENERE TUTTI GLI USER O UNO SPECIFICO

Rotta.get("/user",Sic_T,(req,res)=>{
  let Use=<User>req.user;
  if(Use.role=="Admin"){
    if(req.query.u!=undefined){
    Users_DB.findOne({username:req.query.u},{ email: 1,username: 1, role:1,_id:0})
    .then((user)=>{
      if(user!=null)res.send(user)
      else res.status(404).json({ message: "Utente non trovato" })
    })
    .catch(()=>{
      res.status(500).json({ message: "Errore interno durante la ricerca dell'utente" })
    })
  }
  else{
    Users_DB.find({},{email:1,username:1,role:1,_id:0})
    .then((user)=>{
      if(user!=null)res.send(user);
      else res.status(404).json({ message: "Nessun utente trovato" })
    })
    .catch(()=>{
      res.status(500).json({ message: "Errore interno durante il recupero degli utenti" })
    })
  }
  }

  else{
    res.status(401).json({ message: "Accesso negato" })
  }
})



                                        //DELETE USER/:ID
/********************************************************************************************** */

// Route per eliminare un utente, solo conm ruolo Admin (grazie al JWT)
// Usa l’ID passato nei parametri per cercare ed eliminare l’utente dal database


Rotta.delete("/user/:id",Sic_T,(req,res)=>{
  let Use=<User>req.user;
  if(Use.role=="Admin"){
    Users_DB.findOneAndDelete({username:req.params.id})
    .then((user)=>{
      res.status(201).json({message:"User Deleted"})
    })
    .catch(()=>{
      res.status(500).json({ message: "Errore interno durante l'eliminazione dell'utente" })
    })
  }
  else{
    res.status(401).json({ message: "Accesso negato" })
  }
})



/************************************************* */

//Implemento strategia Basic che verrà usata nel login
passport.use(new BasicStrategy(
    (email, password, done) => {
     Users_DB.findOne({email:email})
        .then((user)=> {
          if (!user) {
            // Nessun utente trovato con questa email
            return done(null, false);
          }
  
          if (user.checkPassword(password)) {
            // Password corretta
            return done(null, user);
          } else {
            // Password errata
            return done(null, false);
          }
        })
        .catch((err) => {
          // Errore nel database
          return done(err);
        });
    }
  ));

export {Rotta,User};
