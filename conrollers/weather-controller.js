import { ApiError } from '../exceptions/api-error.js';
import chalk from "chalk";
import { dateToTimestamp, convertUNIXtoISO } from '../helpers/helpers.js';
import historicalWeatherModel from '../models/historical-weather-model.js';
import mongoose from 'mongoose';
import { getCurrentWheather, getLongForecastWheatherDaily, getPollutionWheather, getShortForecastWheatherHourly } from '../service/weather-service.js';
const  APPID = process.env.STUDENT_API_key;


export const historyWeather = async (req, res, next) => {
    console.log("hello", req.url);
    const appId = process.env.STUDENT_API_key;
    const start = dateToTimestamp(req.body.start); //format string "01/01/2022, date strictement 1 an avant de requete"
    const end = dateToTimestamp(req.body?.end);
    /**
     * latitude d'une ville
     * longitude d'une ville
     * type ex hourly pour chaque
     */
    const {lat, lon, type, cityId} = req.body; 
    console.log(chalk.yellow("lat lon type appid"), lat,  lon,  type,  appId)
    console.log('in hourlyweather avant axios')
        
    try {

    } catch (error) {
            next(err)        
    }
  
}

  

  
export const currentWeather =  async(req, res, next) =>  {
    try{
       const {lat, lon } = req.body; 

        if(!lat || !lon){
            const err = new Error('no coordinates for get weather ');
            throw err;
        }
        let currentWeather = await getCurrentWheather(lat, lon);
        const pollutionWeather = await getPollutionWheather(lat, lon);
        
        console.log("*************************controller", pollutionWeather)
        
        if(pollutionWeather&&pollutionWeather.list.length){
            currentWeather.pollution = pollutionWeather.list[0];
        }
        
        console.log("!!!*************************controller", currentWeather)

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





export const climatWeather =  async(req, res, next) =>  {
    try{
        // const users = await userService.getAllUsers();
        // return res.json(users)

    }catch(err){
        next(err)
    }
}











