"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rotta_s = void 0;
const express_1 = require("./express");
const express_2 = __importDefault(require("express"));
const UserDb_1 = require("./UserDb");
const crypto_1 = __importDefault(require("crypto"));
const Rotta_s = express_2.default.Router();
exports.Rotta_s = Rotta_s;
/***+***+*******************************+ POST DOVE SI CERCA VOLO   */
//  Rotta POST per cercare voli in base a città di partenza, destinazione e data
// Estrae i parametri di ricerca dal corpo della richiesta (from, to, date)
// Inizializza un array per contenere i voli trovati
// Esegue una query su tutti gli utenti nel database per trovare voli che combaciano
// Se nessun volo viene trovato, risponde con un messaggio informativo
// Se vengono trovati utenti con voli corrispondenti:
//  - Filtra i voli esatti per data e tratte
//    - Aggiunge questi voli all’array dei risultati
//    - Aggiorna il conteggio delle visualizzazioni per quella tratta
//    - Salva il documento aggiornato dell’utente nel DB
// Alla fine, restituisce tutti i voli trovati in formato JSON
// Se c'è un errore durante la query o il salvataggio, risponde con errore del server
Rotta_s.post("/search/flights", (req, res) => {
    let Cerca_F = req.body.Cerca_F;
    let Flights_to_s = [];
    UserDb_1.Users_DB.find({
        "Flights.route.from": Cerca_F.from,
        "Flights.route.to": Cerca_F.to,
        "Flights.date": Cerca_F.date
    })
        .then((users) => {
        if (users.length === 0) {
            res.status(200).json({ message: "Nessun Volo Trovato, Cerca altre Destinazioni o date" });
        }
        else {
            for (let user_1 of users) {
                let voliTrovati = user_1.Flights.filter((x) => x.route.from == Cerca_F.from &&
                    x.route.to == Cerca_F.to &&
                    x.date === Cerca_F.date);
                Flights_to_s.push(...voliTrovati);
                user_1.AddingViews(Cerca_F.from, Cerca_F.to);
                user_1.save().catch(() => res.status(500).json({ message: "Errore nel salvataggio" }));
            }
            res.status(200).json({ message: "Ecco i Voli Trovati", flights: Flights_to_s });
        }
    })
        .catch(() => {
        res.status(500).json({ message: "Errore del server" });
    });
});
/***+***+*******************************+ POST DOVE SI ACQUISTO BIGLIETTO  */
//  Rotta POST per l’acquisto di un biglietto in base all’ID del volo
//  Middleware Sic_T: verifica autenticazione e autorizzazione dell’utente
//  Estrae dal body i dettagli del biglietto 
// Crea un oggetto `obje: Ticket_I` con tutte le informazioni necessarie (incl. transaction ID generato)
//  Controlla che l’utente abbia ruolo “User” altrimenti risponde 401
//  Cerca l’utente proprietario del volo sul DB tramite `Flights.id`
//   404 se nessun volo corrisponde
//    Chiama `user.Purchasing(...)` per  aggiornare revenue e i posti disponibili e la disponibilià posti
//     Se `false`, 400: posti insufficienti
//    Se `true`, salva il volo aggiornato e aggiunge il biglietto nella collezione `Tickets` dell’utente
//    Ritorna 201 con `biglietto: obje` e `flight_p: flight` aggiornato
Rotta_s.post("/purchase/flight/:id", express_1.Sic_T, (req, res) => {
    let biglietto_d = req.body.biglietto_d;
    let user_p = req.user;
    let obje = {
        passanger: user_p.email, id_f: req.params.id,
        id_transaction: crypto_1.default.randomBytes(16).toString('hex'),
        seat: { cost: biglietto_d.cost, type: biglietto_d.type, quantity: biglietto_d.n },
        extra_b_20kg: biglietto_d.extra_b,
        DepartureTime: biglietto_d.DepartureTime,
        Date: biglietto_d.Date,
        route: { from: biglietto_d.route.from, to: biglietto_d.route.to },
    };
    if (user_p.role == "User") {
        UserDb_1.Users_DB.findOne({ "Flights.id": req.params.id })
            .then((user) => {
            if (user == null)
                res.status(404).json({ message: "Utente Non trovato" });
            else {
                if (user.Purchasing(req.params.id, { n: biglietto_d.n, type: biglietto_d.type }, user_p.username) == false)
                    res.status(400).json({ message: "IL Numero di Biglietti selezionati va oltre la Disponibilià" });
                else {
                    user.save()
                        .then((user) => {
                        if (user == null)
                            res.status(404).json({ message: "Errore Interno nel salvataggio " });
                        let flight = user.Flights.find((x) => x.id == req.params.id);
                        UserDb_1.Users_DB.findOneAndUpdate({ email: user_p.email }, { $push: { Tickets: obje } })
                            .then((user) => {
                            if (user == null)
                                res.status(404).json({ message: "Errore nella creazione del Biglietto" });
                            else
                                res.status(201).json({ message: "Biglietto Acquistato", biglietto: obje, flight_p: flight });
                        })
                            .catch(() => res.status(500).json({ message: "Errore Interno Nella Crezione del Biglietto" }));
                    })
                        .catch(() => res.status(500).json({ message: "Errore Interno nel salvataggio " }));
                }
            }
        })
            .catch((err) => {
            res.status(500).json({ message: "Errore Interno nel Server" });
        });
    }
    else
        res.status(401).json({ message: "Acesso Negato" });
});
