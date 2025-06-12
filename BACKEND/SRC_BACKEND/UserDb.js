"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = exports.Users_DB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const crypto_1 = __importDefault(require("crypto"));
/***********************************************************************************************************+ */
const Route = new mongoose_1.default.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    views: { type: Number },
    id: { type: Number, required: true }
});
const Aircraft = new mongoose_1.default.Schema({
    id: { type: Number, required: true },
    model: { type: String, default: "Boeing" },
    capacity: { firstclass: { type: Number, required: true }, business: { type: Number, required: true, }, economy: { type: Number, required: true } },
});
const Flight = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    route: { from: { type: String, required: true }, to: { type: String, required: true } },
    aircraft: { type: Number, required: true },
    date: { type: String, required: true },
    departureTime: { type: String, required: true },
    flightTime: { type: String, required: true },
    stop: { type: Number, required: true },
    state: { type: String, default: 'OnTime' },
    owner: { type: String, required: true },
    prices: { firstclass: { type: Number, required: true }, business: { type: Number, required: true, }, economy: { type: Number, required: true } },
    seats_available: {
        firstclass: {
            Num: { type: Number, }, type: { type: String, default: "firstclass" }
        },
        business: {
            Num: { type: Number, }, type: { type: String, default: "business" }
        },
        economy: {
            Num: { type: Number, }, type: { type: String, default: "economy" }
        },
    },
    revenue: Number,
    Passengers: [{ type: String }]
});
const Ticket = new mongoose_1.default.Schema({
    passanger: { type: String, required: true },
    id_f: { type: String, required: true },
    id_transaction: { type: String },
    DepartureTime: { type: String, required: true },
    Date: { type: String, required: true },
    seat: { cost: { type: Number, required: true }, type: { type: String, required: true }, quantity: { type: Number, required: true } },
    extra_b_20kg: { type: Boolean, required: true, default: false },
    route: { from: { type: String, required: true }, to: { type: String, required: true } }
});
const User_Schema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true, default: "Admin" },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    salt: { type: String },
    digest: { type: String },
    firstTime: { type: Boolean, default: false },
    Routes: [Route],
    Aircrafts: [Aircraft],
    Flights: [Flight],
    Tickets: [Ticket],
});
User_Schema.methods.setPassword = function (pwd) {
    this.salt = crypto_1.default.randomBytes(16).toString('hex');
    const hmac = crypto_1.default.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex');
};
User_Schema.methods.checkPassword = function (pwd) {
    const hmac = crypto_1.default.createHmac('sha512', this.salt);
    hmac.update(pwd);
    const digest = hmac.digest('hex');
    return this.digest === digest;
};
/****************************************************** FUNZIONE UPDATER */
//AGGIORNA ROUTE  HO USATO LA FUNZIONE QUI PERCHE' USANDO LE FUNZIONE DI MOONGOSE RISULTA MACCHINOSO
User_Schema.methods.UpdateR = function (rotta) {
    rotta.views = this.Routes.find((x) => x.id == rotta.id).views;
    this.Routes = this.Routes.filter((x) => x.id != rotta.id);
    this.Routes.push(rotta);
};
/****************************************************** FUNZIONE UPDATEA */
//AGGIORNA AIRCRAFT  HO USATO LA FUNZIONE QUI PERCHE' USANDO LE FUNZIONE DI MOONGOSE RISULTA MACCHINOSO
User_Schema.methods.UpdateA = function (aircraft) {
    this.Aircrafts = this.Aircrafts.filter((x) => x.id != aircraft.id);
    this.Aircrafts.push(aircraft);
};
/****************************************************** FUNZIONE UPDATEf */
//AGGIORNA VOLO  HO USATO LA FUNZIONE QUI PERCHE' USANDO LE FUNZIONE DI MOONGOSE RISULTA MACCHINOSO
User_Schema.methods.UpdateF = function (flight) {
    this.Flights = this.Flights.filter((x) => x.id != flight.id);
    this.Flights.push(flight);
};
/****************************************************** FUNZIONE DELETE F1  */
//CANCELLA IL VOLO QUANDO VIENE CANCELLATO UNA ROUTE O UN AIRCRAFT CORRISPONDENTE A QUEL FLIGHT
//ID_R --> ID ROUTE
//ID_A ---> ID AIRCRAFT
User_Schema.methods.DeleteF1 = function (id_r, id_a) {
    if (id_r != undefined)
        this.Flights = this.Flights.filter((x) => x.route.from != id_r.from && x.route.to != id_r.to);
    else
        this.Flights = this.Flights.filter((x) => x.aircraft != id_a);
    return this.Flight;
};
/****************************************************** FUNZIONE ADDING VIEWS  */
//AGGIUNGE UNA VISTA OGNI VOLTA CHE UN UTENTE CERCA UN VOLO CHE CONTIENE ROTTA 
User_Schema.methods.AddingViews = function (from, to) {
    this.Routes.forEach((x) => { if (x.from == from && x.to == to)
        x.views += 1; });
};
/****************************************************** FUNZIONE PURCHASING*/
//ID VOLO
//DATA STA PER BIGLIETTO CHE HA QUANTITA' E TIPO
//NAME STA PER NOME UTENTE 
User_Schema.methods.Purchasing = function (id, data, name) {
    let flight = this.Flights.find((x) => x.id == id);
    if (this.CheckSeats(id, { num: data.n, type: data.type.toLowerCase() }) == false)
        return false;
    else {
        this.Revenue(id, flight.aircraft);
        flight.Passengers.push(name);
        this.Flights = this.Flights.filter((x) => x.id != flight.id);
        this.Flights.push(flight);
        return true;
    }
};
/****************************************************** FUNZIONE CHECKSEATS  */
//FUNZIONE CHE CALCOLA SE CI SONO I POSTI DISPONIBILI RICHIESTI DALL'UTENTE
//ID è ID FLIGHT
// (SE) STA PER  SEAT E HA UN NUMERO CIEO' QUANTITA' RICHIESTA DA UTENTE E TYPE TIPO DI BIGLIETTO 
User_Schema.methods.CheckSeats = function (id, se) {
    let b = true;
    this.Flights.forEach((x) => {
        if (x.id === id) {
            if (x.seats_available.firstclass.type == se.type && x.seats_available.firstclass.Num >= se.num)
                x.seats_available.firstclass.Num = x.seats_available.firstclass.Num - se.num;
            else if (x.seats_available.business.type == se.type && x.seats_available.business.Num >= se.num)
                x.seats_available.business.Num = x.seats_available.business.Num - se.num;
            else if (x.seats_available.economy.type == se.type && x.seats_available.economy.Num >= se.num)
                x.seats_available.economy.Num = x.seats_available.economy.Num - se.num;
            else
                b = false;
        }
    });
    return b;
};
/****************************************************** FUNZIONE REVENUE  */
//FUNZIONE CHE CALCOLA GUADAGNO IN BASE AI POSTI ALLA CAPACITA' DELL AIRCRAFT E POSTI RIMANETI SUL VOLO
//ID_F è ID FLIGHT
//ID_A è ID AIRCRAFT
User_Schema.methods.Revenue = function (id_f, id_a) {
    let flight = this.Flights.find((x) => x.id == id_f);
    this.Aircrafts.forEach((x) => {
        if (x.id === id_a) {
            const soldFirst = x.capacity.firstclass - flight.seats_available.firstclass.Num;
            const soldBusiness = x.capacity.business - flight.seats_available.business.Num;
            const soldEconomy = x.capacity.economy - flight.seats_available.economy.Num;
            const revenueFirst = soldFirst * flight.prices.firstclass;
            const revenueBusiness = soldBusiness * flight.prices.business;
            const revenueEconomy = soldEconomy * flight.prices.economy;
            flight.revenue = revenueFirst + revenueBusiness + revenueEconomy;
            this.Flights = this.Flights.filter((x) => x.id != flight.id);
            this.Flights.push(flight);
        }
    });
};
let Users_DB = mongoose_1.default.model("User", User_Schema);
exports.Users_DB = Users_DB;
/***********************************************************************************************************+ */
