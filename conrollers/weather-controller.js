import { ApiError } from '../exceptions/api-error.js';
import chalk from "chalk";
import historicalWeatherModel from '../models/historical-weather-model.js';
import mongoose from 'mongoose';
import { getCurrentWheather,  getLongForecastWheatherDaily, getPollutionWheather, getShortForecastWheatherHourly } from '../service/weather-service.js';
import CityModel from '../models/city-model.js';
const  APPID = process.env.STUDENT_API_key;


export const historyWeather = async (req, res, next) => {
    const {startDate, endDate, cityId} = req.body;
   
    //verif if dateTimestamp
    if(!startDate || !endDate || !cityId){
        throw ApiError.BadRequest('parametres are incorrecte, can not  get historical weather')
    }
   
    const  cityCandidat = await CityModel.findById(cityId);
   
    if(!cityCandidat){
        throw ApiError.BadRequest("city doesn't exists in data base")
    }
 
    try {
        const dataHisotricalWeather = await   historicalWeatherModel.find({
            "city": cityCandidat._id,
            "dt": { $gte: startDate, $lte: endDate }
          })
          .sort({ "dt": 1 })
        ;

       const coord = {
            lat: cityCandidat.lat,
            lon: cityCandidat.lon
        }
        
        const modifiedCityCandidat = {
            ...cityCandidat.toObject(),
            coord: coord,
          };

        const dataForSend = {
            list: dataHisotricalWeather,
            city: modifiedCityCandidat
        }

        return res.json(dataForSend);
    } catch (error) {
        next(error)        
    }
}

  
export const historyAvailable = async(req, res, next) => {
    const { cityId} = req.body;
   
    if(!cityId){
        throw ApiError.BadRequest('parametres are incorrecte, can not  get historical weather')
    }
   
    try{
        const  cityCandidat = await CityModel.findById(cityId);
   
        if(!cityCandidat){
            throw ApiError.BadRequest("city doesn't exists in data base");
        }
    
    
        const dataHisotricalWeather = await historicalWeatherModel.findOne(
            { 'city': cityCandidat._id }, 
            {}, 
            { sort: { 'dt': 1 }}
        )

        const finded = new Date(dataHisotricalWeather.dt * 1000);

        const dataForReq = {
            dt: dataHisotricalWeather.dt,
            city: cityCandidat._id,
            city_name: cityCandidat.name
        }

        return res.json(dataForReq)
    
    }catch(err){
        next(err)
    }
};
  
export const currentWeather =  async(req, res, next) =>  {
    try{
       const {lat, lon } = req.body; 

        if(!lat || !lon){
            const err = new Error('no coordinates for get weather ');
            throw err;
        }
        let currentWeather = await getCurrentWheather(lat, lon);
        const pollutionWeather = await getPollutionWheather(lat, lon);
        
        if(pollutionWeather&&pollutionWeather.list.length){
            currentWeather.pollution = pollutionWeather.list[0];
        }

        return res.json(currentWeather)

    }catch(err){
        next(err)
    }
}


export const forecastWeatherDaily =  async(req, res, next) =>  {
    try{
        const {lat, lon } = req.body; 

        if(!lat || !lon){
            const err = new Error('no coordinates for get weather ');
            throw err;
        }
        const forecastDailyWeather = await getLongForecastWheatherDaily(lat, lon);
        return res.json(forecastDailyWeather)
    }catch(err){
        next(err)
    }
}


export const forecastWeatherHourly =  async(req, res, next) =>  {
   
    try{
        const {lat, lon } = req.body; 

        if(!lat || !lon){
            const err = new Error('no coordinates for get weather ');
            throw err;
        }
        const forecastHourlyWeather = await getShortForecastWheatherHourly(lat, lon);
        return res.json(forecastHourlyWeather)

    }catch(err){
        next(err)
    }
}

export const pollutionWeather =  async(req, res, next) =>  {
   
    try{
        const {lat, lon } = req.body; 

        if(!lat || !lon){
            const err = new Error('no coordinates for get weather ');
            throw err;
        }
        const pollutionWeather = await getPollutionWheather(lat, lon);
        return res.json(pollutionWeather)

    }catch(err){
        next(err)
    }
}

//TODO
// export const climatWeather =  async(req, res, next) =>  {
//     try{

//     }catch(err){
//         next(err)
//     }
// }











