import chalk from "chalk";
import {  convertUNIXtoISO, getUnixTimestampsYearRange } from '../helpers/helpers.js';
import historicalWeatherModel from '../models/historical-weather-model.js';
import mongoose from 'mongoose';
import axios from 'axios';
const appId = process.env.STUDENT_API_key;


export const historyDataCreate = async(cityId, lat, lon) => {
    
    // we automate start & end dates
    const {  startDateUnix,  endDateUnix } = await getUnixTimestampsYearRange(cityId);

    let   startDate = startDateUnix;
    const endDate = endDateUnix;
    

    try{
        //we build array of range dates
        const dataRangeArray = [];
      
        while (startDate < endDate) {
            const endOfPeriodUnix = startDate + 7 * 24 * 60 * 60; // Add 7 days in  UNIX
            dataRangeArray.push({start: startDate, end: endOfPeriodUnix});
           
            //endOfPeiod became new start range
            startDate = endOfPeriodUnix;  
        }
    
    
        //we call all ranges from open weather
        dataRangeArray.length &&  Promise.all(dataRangeArray.map(async(range) => {
            const weatherData = await getWeatherData(
                range.start,
                range.end,
                lat,
                lon,
                'hour',
                appId
            );
           
            //we save all  req from res openweather
            await  Promise.all(weatherData.list.map(async(dataItem)=> {
              //could we verify here records? 
                const existingRecord = await historicalWeatherModel.findOne({
                    dt: dataItem.dt, 
                    city: cityId 
                });
    
                if(!existingRecord){
                    const historicalWeather = new historicalWeatherModel({
                        dt: dataItem.dt, 
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
                        city: cityId
                    });
    
                    await historicalWeather.save();
                }else{
                    console.log(chalk.blue('existing record', existingRecord))
                }
            }))
        }))
        console.log(chalk.bgGreenBright("fin creating data historical"))
    }catch(err){
        console.error(err)
    }
}

async function getWeatherData(start, end, lat, lon, type='hour' ) {
   
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
  

export const getCurrentWheather =  async(lat, lon) => {

    if(!lat || !lon){
        return;
    }

    const response = await axios.get(process.env.URI_OPEN_WEATHER, {
        params: {
        lat,
        lon,
        units: "metric", // Celsius
        appId:appId
        }
    }); 

    return response.data; 
}

export const getLongForecastWheatherDaily =  async(lat, lon) => {

    if(!lat || !lon){
        return;
    }

    const response = await axios.get(process.env.URI_16DAYS_DAILY_FORECAST_WEATHER, {
        params: {
        lat,
        lon,
        units: "metric",// Celsius
        cnt : 16, // by default 6, can by from 1 to 16 days for display data
        appId:appId
       }
    }); 

    return response.data; 
}

export const getShortForecastWheatherHourly =  async(lat, lon) => {

    if(!lat || !lon){
        return;
    }

    const response = await axios.get(process.env.URI_4DAYS_HOURLY_FORECAST_WEATHER, {
        params: {
        lat,
        lon,
        units: "metric", // Celsius
        appId:appId
        }
    }); 

    return response.data; 
}

export const getPollutionWheather =  async(lat, lon) => {

    if(!lat || !lon){
        return;
    }

    const response = await axios.get(process.env.URI_POLLUTION_WEATHER, {
        params: {
        lat,
        lon,
        appId:appId
        }
    }); 


    return response.data; 
}


export const getHistoryDataHourlyByRange =  async(cityId, start, end) => {

 const response = await   historicalWeatherModel.find({
    "city": mongoose.Types.ObjectId(cityId),
    "dt": { $gte: start, $lte: end }
  })
  .populate('city')
  .sort({ "dt": 1 })

    return response.data; 
}

