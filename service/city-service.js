import { ApiError } from "../exceptions/api-error.js";
import CityModel from "../models/city-model.js";
import { historyDataCreate } from "./weather-service.js";


export const findOrCreateCity = async (city, isHistory) => {

     console.log("city ishisotry", city, isHistory);

    const {lat, lon, name, local_names, country} =  city;
   //verify user exists
    const candidateCity = await CityModel.findOne({lat, lon});

    if(candidateCity){
        console.log('candidateCity exists', candidateCity)
        //we have cityObject but there is not history data in db
        if(isHistory&& !candidateCity.isHistory){
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
        console.log('we created city')
        
        //history part!!!
        if(isHistory){
            console.log("isHistory true", cityDoc._id, cityDoc.lat, cityDoc.lon)
            await historyDataCreate(cityDoc._id, cityDoc.lat, cityDoc.lon);
        }
        const savedCity = await cityDoc.save();
        
       console.log(savedCity)
        return savedCity;
    }
}
