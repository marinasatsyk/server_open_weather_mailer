import { ApiError } from "../exceptions/api-error.js";
import CityModel from "../models/city-model.js";


export const findOrCreateCity = async (city, isFollowingHistory) => {
    // console.log(lat, lon, name, local_names, country);
    const {lat, lon, name, local_names, country} =  city;
   //verify user exists
    const candidateCity = await CityModel.findOne({lat, lon});

    if(candidateCity){
        console.log('candidateCity exists')
        return candidateCity; 
    }else{
        const cityDoc = new CityModel.create({
            name,
            local_names,
            lat,
            lon,
            country,
            isHistory:isFollowingHistory
        }) 
        console.log('we created city')
        const savedCity = await cityDoc.save();
        return savedCity;
    }
}
