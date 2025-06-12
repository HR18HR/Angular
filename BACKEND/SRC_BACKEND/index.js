"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_2 = require("./express"); //ROTTA USATA PER LA GESTIONE TUTTO CIO' CHE RIGUARDA GLI UTENTI (LOGIN REGISTRAZIONE E INFO)
const UserDb_1 = require("./UserDb");
const UserDb_2 = require("./UserDb"); //DB
const route_1 = require("./route"); //ROTTA CHE GESTISCE LA ROUTE 
const aircraft_1 = require("./aircraft"); //ROTTA CHE GESTISCE GLI AIRCRAFT
const flights_1 = require("./flights"); //ROTTA CHE GESTISCE I FLIGHTS
const search_1 = require("./search"); //ROTTA CHE GESTISCE RICERCA VOLI
const app = (0, express_1.default)(); //Creazione server con express
const server = http_1.default.createServer(app); //  
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("", express_2.Rotta);
app.use("", route_1.Rotta_r);
app.use("", aircraft_1.Rotta_a);
app.use("", flights_1.Rotta_f);
app.use("", search_1.Rotta_s);
(0, dotenv_1.config)(); //CCONFIG PER CARICA VARIABILI DA .ENV
//INIZIALIZZAZIONE DB MONGO DB E SEVER IN PORTA 3000 SU LOCALHOST O   0.0.0.0  QUESTO  PER RENDERE IL SERVER RAGGIUNGIBILE DALL'ESTERNO 
if (process.env.MONGO != undefined) {
    UserDb_1.mongoose.connect(process.env.MONGO).then(() => {
        server.listen(3000, "0.0.0.0", () => {
            console.log("SONO ATTIVO");
            UserDb_2.Users_DB.countDocuments().then((numero_d) => {
                if (numero_d == 0) {
                    CreateU();
                    console.log("Utenti Creati");
                }
                else {
                    console.log("DB già occupato");
                }
            });
        });
    })
        .catch((err) => {
        console.log(err);
    });
}
let CreateU = function () {
    const Admin = new UserDb_2.Users_DB({
        email: "admin",
        username: "admin",
        role: "Admin"
    });
    Admin.setPassword("1234");
    Admin.save()
        .then((user) => {
        if (user != null) {
            const newAirline = new UserDb_2.Users_DB({
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
            newAirline.setPassword("1234");
            newAirline.save()
                .then((user) => { if (user == null)
                console.log("Airline Non Creata"); })
                .catch((err) => { console.log("Errore Interno--->", err); });
        }
        else {
            console.log("Admin Non Creato");
        }
    })
        .catch((err) => { console.log("Errore Interno--->", err); });
};
