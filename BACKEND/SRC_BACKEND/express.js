"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rotta = exports.Sic_T = void 0;
const express_1 = __importDefault(require("express")); //express
const passport_1 = __importDefault(require("passport")); //passport
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); //jwt per le sessioni
const express_jwt_1 = require("express-jwt"); //creazione middleware di auth dei JWT
const passport_http_1 = require("passport-http"); //importazione della strategia basic per l'authenticazione 
const UserDb_1 = require("./UserDb");
const dotenv_1 = require("dotenv");
const process_1 = require("process");
(0, dotenv_1.config)();
if (process.env.KEY == undefined)
    (0, process_1.exit)(-1);
const Rotta = express_1.default.Router(); //ROTTA DEFENITA;
exports.Rotta = Rotta;
//MIDDLEWARE DI CHECK DELLA VALIDITA' DEL  JWT IN  ALCUNE ROTTE
exports.Sic_T = (0, express_jwt_1.expressjwt)({
    secret: process.env.KEY,
    algorithms: ['HS256'],
    requestProperty: "user",
});
//ROTTA per l'insermineto di un nuovo user nel DataBase e dunque la registrazione: ENDPOINT -> /registrazione
Rotta.post("/registrazione", (req, res) => {
    UserDb_1.Users_DB.create({ email: req.body.email, username: req.body.username, role: "User" })
        .then((user) => {
        user.setPassword(req.body.password);
        user.save();
        res.json({ message: "Utente Creato" });
    })
        .catch((err) => {
        res.status(409).json({ message: "Errore durante la creazione del tuo profilo ,dati già in uso " });
    });
});
//POST /REGISTRAZIONE/AIRLINE
/************************************************************************* */
//ROTTA REGISTRAZIONE AIRLINE
//DATI VENGONO PRESI DAL BODY DELLA REQUEST
Rotta.post("/registrazione/airline", exports.Sic_T, (req, res) => {
    let User = req.user;
    if (User.role == "Admin") {
        UserDb_1.Users_DB.create({ email: req.body.email, username: req.body.username, role: "Airline", firstTime: true })
            .then((user) => {
            user.setPassword(req.body.password);
            user.save();
            res.json({ message: "Airline Creata" });
        })
            .catch((err) => {
            res.status(409).json({ message: "Errore durante la creazione della Airline,dati già in uso " });
        });
    }
    else {
        res.status(401).json({ message: "Accesso negato" });
    }
});
//PUT /REGISTRAZIONE/AIRLINE
/**********************************************************************************/
//ROTTA MODIFICA DATI  AIRLINE 
//DATI VENGONO PRESI DAL BODY DELLA REQUEST
Rotta.put("/registrazione/airline", exports.Sic_T, (req, res) => {
    let User = req.user;
    if (User.role == "Airline") {
        UserDb_1.Users_DB.findOneAndUpdate({ email: User.email }, { email: req.body.email, username: req.body.username, firstTime: false })
            .then((user) => {
            if (user != null) {
                user.setPassword(req.body.password);
                user.save();
                res.json({ message: "Dati Aggiornati" });
            }
            else
                res.status(404).json({ message: "Utente non trovato" });
        })
            .catch((err) => {
            res.status(409).json({ message: "Errore durante l'aggiornamento dei dati,dati già in uso " });
        });
    }
    else {
        res.status(401).json({ message: "Accesso negato" });
    }
});
//ROTTA per l'autenticazione: Uso di basic senza sessione che verrà gestita dai jwt.: ENDPOINT -> /login
Rotta.post("/login", passport_1.default.authenticate('basic', { session: false }), (req, res) => {
    let user = req.user;
    UserDb_1.Users_DB.findOne({ email: user.email })
        .then((User) => {
        if (User != null) {
            let token = jsonwebtoken_1.default.sign({ email: User.email, username: User.username, role: User.role, firstTime: User.firstTime, Tickets: User.Tickets }, process.env.KEY, { expiresIn: '1d' });
            res.status(200).json({ toke: token, message: "Benvenuto" });
        }
        else
            res.status(500).json({ message: User });
    })
        .catch((err) => {
        res.status(500).json({ message: "Errore interno durante la ricerca dell'utente" });
    });
});
//GET USER ?u=
/****************************************************************************************************** */
//ROTTA USATA DA ADMIN E QUINDI CHIUSA PER OTTENERE TUTTI GLI USER O UNO SPECIFICO
Rotta.get("/user", exports.Sic_T, (req, res) => {
    let Use = req.user;
    if (Use.role == "Admin") {
        if (req.query.u != undefined) {
            UserDb_1.Users_DB.findOne({ username: req.query.u }, { email: 1, username: 1, role: 1, _id: 0 })
                .then((user) => {
                if (user != null)
                    res.send(user);
                else
                    res.status(404).json({ message: "Utente non trovato" });
            })
                .catch(() => {
                res.status(500).json({ message: "Errore interno durante la ricerca dell'utente" });
            });
        }
        else {
            UserDb_1.Users_DB.find({}, { email: 1, username: 1, role: 1, _id: 0 })
                .then((user) => {
                if (user != null)
                    res.send(user);
                else
                    res.status(404).json({ message: "Nessun utente trovato" });
            })
                .catch(() => {
                res.status(500).json({ message: "Errore interno durante il recupero degli utenti" });
            });
        }
    }
    else {
        res.status(401).json({ message: "Accesso negato" });
    }
});
//DELETE USER/:ID
/********************************************************************************************** */
// Route per eliminare un utente, solo conm ruolo Admin (grazie al JWT)
// Usa l’ID passato nei parametri per cercare ed eliminare l’utente dal database
Rotta.delete("/user/:id", exports.Sic_T, (req, res) => {
    let Use = req.user;
    if (Use.role == "Admin") {
        UserDb_1.Users_DB.findOneAndDelete({ username: req.params.id })
            .then((user) => {
            res.status(201).json({ message: "User Deleted" });
        })
            .catch(() => {
            res.status(500).json({ message: "Errore interno durante l'eliminazione dell'utente" });
        });
    }
    else {
        res.status(401).json({ message: "Accesso negato" });
    }
});
/************************************************* */
//Implemento strategia Basic che verrà usata nel login
passport_1.default.use(new passport_http_1.BasicStrategy((email, password, done) => {
    UserDb_1.Users_DB.findOne({ email: email })
        .then((user) => {
        if (!user) {
            // Nessun utente trovato con questa email
            return done(null, false);
        }
        if (user.checkPassword(password)) {
            // Password corretta
            return done(null, user);
        }
        else {
            // Password errata
            return done(null, false);
        }
    })
        .catch((err) => {
        // Errore nel database
        return done(err);
    });
}));
