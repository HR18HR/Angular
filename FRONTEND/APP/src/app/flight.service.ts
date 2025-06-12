import { Injectable } from '@angular/core';
import { CanActivate,ActivatedRouteSnapshot,RouterStateSnapshot,MaybeAsync,GuardResult, Route} from '@angular/router';
import { Userservice } from './User.service';
import { HttpClient,HttpHeaders, JsonpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';

//interface Route uguale a quella su mongo
export interface Route_I{
  from:string,
  to:string,
  views:number,
  id:number
}
//interface Aircraft uguale a quella su mongo
export interface Aircraft_I{
  id:number,
  model:string,
  capacity:{
    firstclass:number,
    business:number,
    economy:number
  }
}
//interface Flight uguale a quella su mongo
 export interface Flight_I {
  id:string,
  route:{from:string,to:string}
  aircraft:number,
  date:string,
  departureTime: string;  
  flightTime: string;    
  stop:number;    
  state:string,
  owner:string,
  prices:{ firstclass:number, business: number;  economy: number;};
  seats_available:{firstclass:{Num:number,type:String},business:{Num:number,type:String},economy:{Num:number,type:String}},
  revenue:number
  Passengers:string[]
}


@Injectable({
  providedIn: 'root'
})
export class FlightService implements CanActivate{

  constructor(public U_S:Userservice,public http:HttpClient) { }


                                          // CreateRotta
/************************************************************************************************************/

// Crea una nuova rotta inviando i dati (from, to, id) con autorizzazione JWT

  CreateRotta(rotta:Route_I,token:string):Observable<{message:string,rotta:Route_I}>{
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<{message:string,rotta:Route_I}>('http://localhost:3000/route',{rotta:rotta},{headers:header})
  }



                                    //Update rotta
/************************************************************************************************************/

// Aggiorna una rotta esistente, modificando from e/o to in base ai parametri forniti

  UpdateRotta(id:string,rotta:Route_I,token:string):Observable<{message:string,rotta:Route_I}>{
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
   return this.http.put<{message:string,rotta:Route_I}>('http://localhost:3000/route/'+id,{rotta:rotta},{headers:header})
   
    
    
  }




                                    //DELETE ROTTE
/************************************************************************************************************/

// Elimina una rotta specificata dall'id con autorizzazione JWT

DeleteRoute(id:string,token:string):Observable<{message:string,flights:Flight_I[]}>{
  const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.delete<{message:string,flights:Flight_I[]}>('http://localhost:3000/route/'+id,{headers:header})
  }



                                    //GET ROTTE 
/************************************************************************************************************/

// Recupera tutte le rotte con autorizzazione JWT

GetRotte(token:string):Observable<Route_I[]>{
  const header = new HttpHeaders({
    'Authorization': 'Bearer ' + token
  });
  return this.http.get<Route_I[]>('http://localhost:3000/routes',{headers:header})
  
}




                                          // CreateAircraft
/************************************************************************************************************/

// Crea un nuovo aereo con specifiche sui posti firstclass, business ed economy


  CreateAircraft(aircraft:Aircraft_I,token:string):Observable<{message:string,aircraft:Aircraft_I}>{
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<{message:string,aircraft:Aircraft_I}>('http://localhost:3000/aircraft',{aircraft:aircraft},{headers:header})
  }


                                    //GET AIRCRAFTS
/************************************************************************************************************/

// Recupera la lista di tutti gli aerei

GetAircrafts(token:string):Observable<Aircraft_I[]>{
  const header = new HttpHeaders({
    'Authorization': 'Bearer ' + token
  });
  return this.http.get<Aircraft_I[]>('http://localhost:3000/aircrafts',{headers:header})
  
}



                                    //DELETE AIRCRAFT
/************************************************************************************************************/

// Elimina un aereo specificato dall'id


DeleteAircraft(id:string,token:string):Observable<{message:string,Flights:Flight_I[]}>{
  const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.delete<{message:string,Flights:Flight_I[]}>('http://localhost:3000/aircraft/'+id,{headers:header})
  }




                                    //Update Aircraft
/************************************************************************************************************/

// Aggiorna un aereo specificato dall'id con nuovi valori per firstclass, business ed economy

  UpdateAircraft(id:string,aircarft:Aircraft_I,token:string):Observable<{message:string,aircraft:Aircraft_I}>{
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.put<{message:string,aircraft:Aircraft_I}>('http://localhost:3000/aircraft/'+id,{aircraft:aircarft},{headers:header})
    
  }



                                          // CreateFlight
/************************************************************************************************************/

// Crea un nuovo volo inviando l'oggetto volo completo

  CreateFlight(flight:Flight_I,token:string):Observable<{message:string,flight:Flight_I}>{
    const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<{message:string,flight:Flight_I}>('http://localhost:3000/flight',{flight:flight},{headers:header})
  }



                                   //GET FLIGHTS
/************************************************************************************************************/

// Recupera tutti i voli disponibili

GetFlights(token:string):Observable<Flight_I[]>{
  const header = new HttpHeaders({
    'Authorization': 'Bearer ' + token
  });
  return this.http.get<Flight_I[]>('http://localhost:3000/flights',{headers:header})

}


                                    //DELETE FLIGHTS
/************************************************************************************************************/

// Elimina un volo specificato dall'id

DeleteFlight(id:string,token:string):Observable<{message:string}>{
  const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.delete<{message:string}>('http://localhost:3000/flight/'+id,{headers:header})
}

                                            // UPDATE FLIGHTS
/************************************************************************************************************/

// Aggiorna un volo specificato dall'id con i dati forniti nell'oggetto flight_up


UpdateFlight(id:string,flight_up:Flight_I,token:string):Observable<{message:string,flight:Flight_I}>{
   const header = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.put<{message:string,flight:Flight_I}>('http://localhost:3000/flight/'+id,{flight_up:flight_up},{headers:header})

}









// Guard per le rotte che controlla l'accesso basandosi sul valore booleano guardAir del servizio U_S

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.U_S.guardAir;
    } 
   
   
}
