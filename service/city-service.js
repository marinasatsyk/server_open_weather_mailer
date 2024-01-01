import CityModel from "../models/city-model.js";
import { historyDataCreate } from "./weather-service.js";

//create city
export const findOrCreateCity = async (city, isHistory) => {

    const {lat, lon, name, local_names, country} =  city;
   //verify user exists
    const candidateCity = await CityModel.findOne({lat, lon});

    if(candidateCity){
        //we have cityObject but there is not history data in db

        // if(isHistory&& !candidateCity.isHistory){
        if(isHistory){
            //we search and save history
           await historyDataCreate(candidateCity._id, candidateCity.lat, candidateCity.lon);
           //we change status of history of current city
           candidateCity.isHistory =  true;
           //we save candidate changes
           await candidateCity.save();
        }
        return candidateCity; 
    }else{
        const cityDoc = new CityModel({
            name,
            local_names,
            lat,
            lon,
            country,
            isHistory
        }) 
        
        //history part
        if(isHistory){
            await historyDataCreate(cityDoc._id, cityDoc.lat, cityDoc.lon);
        }
        const savedCity = await cityDoc.save();
        
        return savedCity;
    }
}
