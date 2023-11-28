import { ApiError } from '../exceptions/api-error.js';
import chalk from "chalk";
import { dateToTimestamp, convertUNIXtoISO, getUnixTimestampsYearRange } from '../helpers/helpers.js';
import historicalWeatherModel from '../models/historical-weather-model.js';
import mongoose from 'mongoose';
import axios from 'axios';
const appId = process.env.STUDENT_API_key;


export const historyDataCreate = async(cityId, lat, lon) => {
    console.log(chalk.blue('in history', cityId, typeof cityId, lat, lon))
 // we automatize start & end dates
    const { startDate, endDate } = await getUnixTimestampsYearRange();
    console.log(chalk.redBright('range:', startDate, endDate));
    const start =startDate;
    const end = endDate;

    try{
        const yearlyData = await fetchYearlyWeather(start, end, lat, lon);
        console.log(chalk.blue("yearlyData")  , chalk.bgGreen("length", yearlyData.length), yearlyData[0])
        // Traitement des données annuelles ici
        for(const dataItem of yearlyData[0]){
                
                const existingRecord = await historicalWeatherModel.findOne({
                    dt: dataItem.dt , // Convertissez la date UNIX en objet Date
                    // zip: zipCode,
                    city: cityId // Remplacez par la valeur correcte pour zip
                });

                 if(existingRecord){
                    // throw ApiError.apply(`for ${dataItem.dt} the records exists`);
                    // const error = new Error();
                    // error.message = `for ${dataItem.dt} the records exists`;
                    // throw error;
                    console.log(chalk.redBright('enregistrement existe', existingRecord.dt))
                 }else{

                    const historicalWeather = new historicalWeatherModel({
                        dt: dataItem.dt, // Convertissez la date UNIX en objet Date
                        main: {
                            temp: dataItem.main.temp,
                            feels_like: dataItem.main.feels_like,
                            pressure: dataItem.main.pressure,
                            humidity: dataItem.main.humidity,
                            temp_min: dataItem.main.temp_min,
                            temp_max: dataItem.main.temp_max,
                        },
                        wind: {
                            speed: dataItem.wind.speed,
                            deg: dataItem.wind.deg,
                        },
                        clouds: {
                            all: dataItem.clouds.all,
                        },
                        weather: dataItem.weather.map(item => {
                                return{id: item.id,
                                    main: item.main,
                                    description: item.description,
                                    icon: item.icon,}               
                            }),
                        // zip: zipCode, // Remplacez par la valeur correcte pour zip
                        city: cityId
                    });

                    await historicalWeather.save();
                    console.log(chalk.bgGreenBright('Nouvel enregistrement inséré dans la base de données.'));
                }
                console.log("********Données météorologiques annuelles :", yearlyData);
        }

    }catch(err){
        console.error(err)
    }

}


async function getWeatherData(start, end, lat, lon, type='hour') {
    console.log("in getWeatherData")
    const response = await axios.get(process.env.URI_HISTORY_WEATHER, {
        params: {
        lat,
        lon,
        type,
        start,
        end,
        units: "metric", // Celsius
        appId:appId
        }
    }); 
    return response.data; 
}
  
// Fonction récursive avec délai pour récupérer l'historique météorologique pour une année complète.
// Data retourné par 7 jours, on itere 
async function fetchYearlyWeather(startDateUnix, endDateUnix, lat, lon, type='hour') {
    const data = [];

    while (startDateUnix < endDateUnix) {
        console.log("while", convertUNIXtoISO(startDateUnix), convertUNIXtoISO(endDateUnix))
        const endOfPeriodUnix = startDateUnix + 7 * 24 * 60 * 60; // Ajoute 7 jours en secondes UNIX

        const weatherData = await getWeatherData(
            startDateUnix,
            endOfPeriodUnix,
            lat,
            lon,
            type,
            appId
        );
        
        const convertedWeatherData = {
            ...weatherData,
            list: weatherData.list.map((item) => ({
                ...item,
                dt: convertUNIXtoISO(item.dt)
            }))
        };
        data.push(convertedWeatherData.list);

        startDateUnix = endOfPeriodUnix; // Met à jour la date de début pour la prochaine itération

        // Attendez 500 millisecondes avant de lancer la prochaine requête
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // À ce stade, "data" contient les données météorologiques pour chaque période de 7 jours
    // Vous pouvez traiter ces données ou les renvoyer, selon vos besoins
    return data;
}
