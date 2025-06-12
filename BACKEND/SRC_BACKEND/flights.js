"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rotta_f = void 0;
const express_1 = require("./express");
const express_2 = __importDefault(require("express"));
const UserDb_1 = require("./UserDb");
const Rotta_f = express_2.default.Router();
exports.Rotta_f = Rotta_f;
//FLIGHT
/************************************************************************************************************/
//CREAZIONE FLIGHT CON POST        /FLIGHT
//ho deciso di inviare l'ogetto fligHt da creare nel body e di creare uno da capo che avrà delle proprità non inserite nel lato client
//controlla che l'id flight non sia usato a livello globale
//conrolla che le rotte inserite e l'aircraft usato siano persenti 
Rotta_f.post("/flight", express_1.Sic_T, (req, res) => {
    let company = req.user;
    let flight = req.body.flight;
    if (company.role == "Airline") {
        UserDb_1.Users_DB.find({ "Flights.id": flight.id })
            .then((user) => {
            if (user.length >= 1)
                res.status(409).json({ message: "ID gia Usato " });
            else {
                UserDb_1.Users_DB.findOne({ email: company.email })
                    .then((user) => {
                    if (user == null)
                        res.status(404).json({ message: 'Utente non trovato' });
                    else {
                        if (user.Routes.find((x) => x.from == flight.route.from && x.to == flight.route.to) &&
                            user.Aircrafts.find((x) => x.id == flight.aircraft)) {
                            let r = user.Routes.find((x) => x.from == flight.route.from && x.to == flight.route.to);
                            let a = user.Aircrafts.find((x) => x.id == flight.aircraft);
                            let fli = {
                                id: flight.id,
                                route: { from: r === null || r === void 0 ? void 0 : r.from, to: r === null || r === void 0 ? void 0 : r.to },
                                aircraft: a === null || a === void 0 ? void 0 : a.id,
                                date: flight.date,
                                departureTime: flight.departureTime,
                                flightTime: flight.flightTime,
                                stop: flight.stop,
                                owner: user.username,
                                state: flight.state,
                                prices: {
                                    firstclass: flight.prices.firstclass,
                                    business: flight.prices.business,
                                    economy: flight.prices.economy,
                                },
                                seats_available: {
                                    firstclass: { Num: a === null || a === void 0 ? void 0 : a.capacity.firstclass, type: "firstclass" },
                                    business: { Num: a === null || a === void 0 ? void 0 : a.capacity.business, type: "business" },
                                    economy: { Num: a === null || a === void 0 ? void 0 : a.capacity.economy, type: "economy" },
                                },
                                revenue: flight.revenue,
                                Passengers: flight.Passengers
                            };
                            UserDb_1.Users_DB.findOneAndUpdate({ email: user.email }, { $push: { Flights: fli } })
                                .then((user) => {
                                res.status(201).json({ message: "Flight Created", flight: fli });
                            })
                                .catch((err) => {
                                res.status(500).json({ message: "Flight Non creato" });
                            });
                        }
                        else
                            res.status(404).json({ message: 'Rotta o Aircraft non presenti nel DB ' });
                    }
                });
            }
        })
            .catch(() => {
            res.status(500).json({ message: "Errore Interno nel Server" });
        });
    }
    else
        res.status(401).json({ message: "Accesso negato" });
});
// GET   /FLIGHT
/*****************************************************************************/
// Route per ottenere tutti i voli associati alla compagnia aerea autenticata
// Cerca l’utente in base all’email, se trovato restituisce l’array Flights                           
Rotta_f.get("/flights", express_1.Sic_T, (req, res) => {
    let company = req.user;
    if (company.role == "Airline") {
        UserDb_1.Users_DB.findOne({ email: company.email })
            .then((user) => {
            if (user == null)
                res.status(404).json({ message: "Utente non trovato" });
            else {
                res.status(200).send(user.Flights);
            }
        })
            .catch(() => {
            res.status(500).json({ message: "Errore interno durante il recupero dei voli" });
        });
    }
    else
        res.status(401).json({ message: "Accesso negato" });
});
//DELETE FLIGHT/:ID
/*************************************************************************/
// Route per eliminare un volo specifico associato alla compagnia aerea autenticata
// Usa $pull per rimuovere il volo dall’array Flights nel documento utente                        
Rotta_f.delete("/flight/:id", express_1.Sic_T, (req, res) => {
    let company = req.user;
    if (company.role == "Airline") {
        UserDb_1.Users_DB.findOneAndUpdate({ email: company.email }, { $pull: { Flights: { id: req.params.id } } })
            .then((user) => {
            if (user != null) {
                res.status(200).json({ message: "Flight Deleted" });
            }
            else
                res.status(404).json({ message: "Utente non trovato" });
        })
            .catch((err) => res.status(500).json({ message: "Errore interno durante la rimozione del volo esistente" }));
    }
    else
        res.status(401).json({ message: "Accesso negato" });
});
// PUT  //FLIGHT/:ID
/*******************************************************************************************/
// Route per aggiornare un volo specifico associato alla compagnia aerea autenticata
// Cerca l’utente, aggiorna il volo tramite il metodo (UpdateF) e salva il documento
Rotta_f.put("/flight/:id", express_1.Sic_T, (req, res) => {
    let company = req.user;
    let flight_up = req.body.flight_up; //flight già aggiornato nel req.body è basterà fare push
    if (company.role === "Airline") {
        UserDb_1.Users_DB.findOne({ email: company.email })
            .then(user => {
            if (user == null) {
                res.status(404).json({ message: "Utente non trovato" });
            }
            else {
                user.UpdateF(flight_up);
                user.save()
                    .then(() => {
                    res.status(200).json({ message: "Volo aggiornato con successo", flight: flight_up });
                })
                    .catch(() => {
                    res.status(500).json({ message: "Errore durante il salvataggio del volo" });
                });
            }
        })
            .catch(() => {
            res.status(500).json({ message: "Errore durante la ricerca dell'utente" });
        });
    }
    else {
        res.status(401).json({ message: "Accesso negato" });
    }
});
