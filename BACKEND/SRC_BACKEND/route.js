"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rotta_r = void 0;
const express_1 = require("./express");
const express_2 = __importDefault(require("express"));
const UserDb_1 = require("./UserDb");
const Rotta_r = express_2.default.Router();
exports.Rotta_r = Rotta_r;
//ROUTE
//POST /ROUTE
/************************************************************************************************************/
// Route per creare una nuova rotta, accessibile solo agli utenti con ruolo “Airline”
// Controlla se la rotta esiste già (in base a id o from/to) e, se non esiste, la aggiunge al database
// Gestisce errori di duplicazione, accesso, inserimento e ricerca dell’utente
Rotta_r.post("/route", express_1.Sic_T, (req, res) => {
    let company = req.user;
    let rotta = req.body.rotta;
    if (company.role == "Airline") {
        UserDb_1.Users_DB.findOne({ email: company.email })
            .then((user) => {
            if ((user === null || user === void 0 ? void 0 : user.Routes.find((x) => x.from == rotta.from && x.to == rotta.to)) || (user === null || user === void 0 ? void 0 : user.Routes.find((x) => x.id == rotta.id)))
                res.status(409).json({ message: "Rotta già esistente" });
            else {
                UserDb_1.Users_DB.findOneAndUpdate({ email: company.email }, { $push: { Routes: rotta } })
                    .then((user) => {
                    if (user != null)
                        res.status(201).json({ message: "Route Created", rotta: rotta });
                    else
                        res.status(404).json({ message: "Errore nel salvataggio della route" });
                })
                    .catch((err) => {
                    res.status(500).json({ message: "Errore interno durante la creazione della rotta" });
                });
            }
        })
            .catch((err) => {
            res.status(500).json({ message: "Errore interno durante la ricerca dell'utente" });
        });
    }
    else
        res.status(401).json({ message: "Accesso negato" });
});
// DELETE /ROUTE/:ID
/************************************************************************/
// Route per eliminare una rotta specifica e i voli associati, accessibile solo a utenti con ruolo “Airline”
// Cerca l’utente, verifica l’esistenza della rotta, la rimuove e elimina  anche i voli connessi
Rotta_r.delete("/route/:id", express_1.Sic_T, (req, res) => {
    let company = req.user;
    let flights = [];
    if (company.role == "Airline") {
        // 1) Trova l'utente e estrai from/to
        UserDb_1.Users_DB.findOne({ email: company.email })
            .then(user => {
            if (user == null) {
                res.status(404).json({ message: "Utente non trovato" });
            }
            else {
                let rottd = user.Routes.find(x => x.id == parseInt(req.params.id));
                if (rottd == undefined) {
                    res.status(404).json({ message: "Rotta non trovata" });
                }
                else {
                    const id_r = { from: rottd.from, to: rottd.to };
                    // 2) Rimuovi la rotta con $pull e ottieni il doc aggiornato
                    UserDb_1.Users_DB.findOneAndUpdate({ email: company.email }, { $pull: { Routes: { id: parseInt(req.params.id) } } }, { new: true })
                        .then(user => {
                        if (user == null) {
                            res.status(404).json({ message: "Utente non trovato" });
                        }
                        else {
                            flights = user.DeleteF1(id_r, undefined);
                            user.save()
                                .then(() => {
                                res.status(200).json({
                                    message: "Rotta e voli associati eliminata",
                                    flights: flights
                                });
                            })
                                .catch(() => {
                                res.status(500).json({ message: "Errore durante il salvataggio delle modifiche" });
                            });
                        }
                    })
                        .catch(() => {
                        res.status(500).json({ message: "Errore interno durante l'eliminazione della rotta" });
                    });
                }
            }
        })
            .catch(() => {
            res.status(500).json({ message: "Errore interno durante la ricerca dell'utente" });
        });
    }
    else {
        res.status(401).json({ message: "Accesso negato" });
    }
});
//PUT /ROUTE/:ID
/*********************************************************************************/
// Route per aggiornare una rotta specifica associata alla compagnia aerea autenticata
// Verifica che l’utente sia di ruolo “Airline” e utilizza un metodo personalizzato per aggiornare la rotta
Rotta_r.put("/route/:id", express_1.Sic_T, (req, res) => {
    let company = req.user;
    let rotta = req.body.rotta;
    if (company.role === "Airline") {
        UserDb_1.Users_DB.findOne({ email: company.email })
            .then((user) => {
            if (user == null)
                res.status(404).json({ message: "Utente non trovato" });
            else {
                user.UpdateR(rotta);
                user.save()
                    .then((user) => {
                    res.json({ message: "Route Updated", rotta: user.Routes.find((x) => x.id == rotta.id) });
                })
                    .catch(() => {
                    res.status(500).json({ message: "Errore durante aggiornamento rotta" });
                });
            }
        })
            .catch(() => {
            res.status(500).json({ message: "Errore Interno nella ricerca dell'Utente" });
        });
    }
    else
        res.status(401).json({ message: "Accsso Negato" });
});
//GET /ROUTE 
/******************************************************************************/
//Route per recuperare tutte le rotte associate a una compagnia aerea autenticata
// Controlla che l’utente abbia il ruolo “Airline” e restituisce le rotte dal database
Rotta_r.get("/routes", express_1.Sic_T, (req, res) => {
    let company = req.user;
    if (company.role == "Airline") {
        UserDb_1.Users_DB.findOne({ email: company.email })
            .then((user) => {
            if (user != null)
                res.send(user === null || user === void 0 ? void 0 : user.Routes);
            else
                res.status(404).json({ message: "Utente non trovato" });
        })
            .catch(() => {
            res.status(500).json({ message: "Errore interno durante il recupero delle rotte" });
        });
    }
    else
        res.status(401).json({ message: "Accesso negato" });
});
