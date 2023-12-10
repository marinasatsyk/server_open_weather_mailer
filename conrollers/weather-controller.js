import { ApiError } from '../exceptions/api-error.js';
import chalk from "chalk";
import { dateToTimestamp, convertUNIXtoISO } from '../helpers/helpers.js';
import historicalWeatherModel from '../models/historical-weather-model.js';
import mongoose from 'mongoose';
import { getCurrentWheather } from '../service/weather-service.js';
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
        // const yearlyData = await fetchYearlyWeather(start, end, lat, lon, type, appId);
        // console.log(chalk.blue("yearlyData")  , chalk.bgGreen("length", yearlyData.length), yearlyData)
        // // Traitement des données annuelles ici
        // for(const dataItem of yearlyData[0]){
           
        //     const existingRecord = await historicalWeatherModel.findOne({
        //         dt: dataItem.dt , // Convertissez la date UNIX en objet Date
        //         // zip: zipCode,
        //         city: mongoose.Types.ObjectId(cityId) // Remplacez par la valeur correcte pour zip
        //     });

        //     if(existingRecord){
        //         throw ApiError.apply(`for ${dataItem.dt} the records exists`)
        //         // const error = new Error();
        //         // error.message = `for ${dataItem.dt} the records exists`;
        //         // throw error;

        //     }
        //     // console.log(chalk.redBright(dataItem.dt), dataItem.main);
        //     if (!existingRecord) {
        //         const historicalWeather = new historicalWeatherModel({
        //             dt: dataItem.dt, // Convertissez la date UNIX en objet Date
        //             main: {
        //                 temp: dataItem.main.temp,
        //                 feels_like: dataItem.main.feels_like,
        //                 pressure: dataItem.main.pressure,
        //                 humidity: dataItem.main.humidity,
        //                 temp_min: dataItem.main.temp_min,
        //                 temp_max: dataItem.main.temp_max,
        //             },
        //             wind: {
        //                 speed: dataItem.wind.speed,
        //                 deg: dataItem.wind.deg,
        //             },
        //             clouds: {
        //                 all: dataItem.clouds.all,
        //             },
        //             weather: dataItem.weather.map(item => {
        //                     return{id: item.id,
        //                         main: item.main,
        //                         description: item.description,
        //                         icon: item.icon,}               
        //                 }),
        //             // zip: zipCode, // Remplacez par la valeur correcte pour zip
        //             city: mongoose.Types.ObjectId(cityId)
        //         });

        //         await historicalWeather.save();
        //         console.log(chalk.bgGreenBright('Nouvel enregistrement inséré dans la base de données.'));
        //     }
        //     console.log("********Données météorologiques annuelles :", yearlyData);
        // }
    } catch (error) {
            next(err)        
    }
  
}

  

  
export const currentWeather =  async(req, res, next) =>  {
    try{
       const {lat, lon } = req.body; 
        console.log("*************************", req.body);

    if(!lat || !lon){
     const err = new Error('no data for get weather ');
     throw err;
    }

     const currentWeather = await getCurrentWheather(lat, lon);

       return res.json(currentWeather)

    }catch(err){
        next(err)
    }
}



export const forecastWeather =  async(req, res, next) =>  {
    try{
        // const users = await userService.getAllUsers();
        // return res.json(users)

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











