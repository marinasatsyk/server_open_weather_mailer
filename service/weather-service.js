import { ApiError } from '../exceptions/api-error.js';
import chalk from "chalk";
import { dateToTimestamp, convertUNIXtoISO, getUnixTimestampsYearRange } from '../helpers/helpers.js';
import historicalWeatherModel from '../models/historical-weather-model.js';
import mongoose from 'mongoose';
import axios from 'axios';
import CityModel from '../models/city-model.js';
const appId = process.env.STUDENT_API_key;


export const historyDataCreate = async(cityId, lat, lon) => {
    console.log(chalk.blue('in history', cityId, typeof cityId, lat, lon))
 // we automatize start & end dates
    const {  startDateUnix,  endDateUnix } = await getUnixTimestampsYearRange(cityId);

    let   startDate = startDateUnix;
    const endDate = endDateUnix;
    console.log(chalk.redBright('historyDataCreate range:', startDate, endDate));

    try{
        console.log(chalk.redBright('!!!!!!start fetch function'))
        //we build array of range dates
        const dataRangeArray = [];
      
        while (startDate < endDate) {
            console.log("while", convertUNIXtoISO(startDate), convertUNIXtoISO(endDate))
            const endOfPeriodUnix = startDate + 7 * 24 * 60 * 60; // Add 7 days in  UNIX
            dataRangeArray.push({start: startDate, end: endOfPeriodUnix});
           
            //endOfPeiod became new start range
            startDate = endOfPeriodUnix;  
        }
    
        console.log(chalk.bgCyanBright('dataRangeArray', dataRangeArray.length));
    
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
            Promise.all(weatherData.list.map(async(dataItem)=> {
              //could we verify here records? 
                const existingRecord = await historicalWeatherModel.findOne({
                    dt: dataItem.dt, 
                    city: cityId 
                });
    
                // console.log(dataItem.dt)
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
                    console.log(chalk.blueBright('Nouvel enregistrement inséré dans la base de données.'));
                }else{
                    console.log(chalk.bgGray('existing record', existingRecord))
                }
            }))
        }))

    }catch(err){
        console.error(err)
    }

}


async function getWeatherData(start, end, lat, lon, type='hour' ) {
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
  



/**OPTIMISED  */
//recursive function with delay for get history weaher for full year   
//global data sent by 7 days , we iterate  

// async function fetchYearlyWeather(startDateUnix, endDateUnix, lat, lon, cityId, type='hour') {
//     console.log(chalk.redBright('!!!!!!start fetch function'))
    
//     //we build array of range dates
//     const dataRangeArray = [];
//     while (startDateUnix < endDateUnix) {
//         console.log("while", convertUNIXtoISO(startDateUnix), convertUNIXtoISO(endDateUnix))
//         const endOfPeriodUnix = startDateUnix + 7 * 24 * 60 * 60; // Add 7 days in  UNIX
//         dataRangeArray.push({start: startDateUnix, end: endOfPeriodUnix});
//         // //we search start day and and day in db. it there is no records we call openweather
//         // const existingRecordStart = await historicalWeatherModel.findOne({
//         //     dt: startDateUnix, 
//         //     city: cityId 
//         // });
//         // const existingRecordEnd = await historicalWeatherModel.findOne({
//         //     dt: endOfPeriodUnix, 
//         //     city: cityId 
//         // });
//         //  
//         // if(!existingRecordStart&&!existingRecordEnd){
//         //     dataRangeArray.push({start: startDateUnix, end: endOfPeriodUnix});
//         // }else{
//         //     console.log(chalk.bgWhiteBright('record exists', existingRecordStart, existingRecordEnd))
//         // }
//         // // update start date before next request iteration
//         startDateUnix = endOfPeriodUnix;  
//     }

//     console.log(chalk.bgCyanBright('dataRangeArray', dataRangeArray.length));

//     //we call all ranges from open weather
//     dataRangeArray.length &&  Promise.all(dataRangeArray.map(async(range) => {
//         const weatherData = await getWeatherData(
//             range.start,
//             range.end,
//             lat,
//             lon,
//             type,
//             appId
//         );
//         //we save all  req from res openweather
//         Promise.all(weatherData.list.map(async(dataItem)=> {
//           //could we verify here records? 
//             const existingRecord = await historicalWeatherModel.findOne({
//                 dt: dataItem.dt, 
//                 city: cityId 
//             });

//             // console.log(dataItem.dt)
//             if(!existingRecord){
//                 const historicalWeather = new historicalWeatherModel({
//                     dt: dataItem.dt, 
//                     main: {
//                         temp: dataItem.main.temp,
//                         feels_like: dataItem.main.feels_like,
//                         pressure: dataItem.main.pressure,
//                         humidity: dataItem.main.humidity,
//                         temp_min: dataItem.main.temp_min,
//                         temp_max: dataItem.main.temp_max,
//                     },
//                     wind: {
//                         speed: dataItem.wind.speed,
//                         deg: dataItem.wind.deg,
//                     },
//                     clouds: {
//                         all: dataItem.clouds.all,
//                     },
//                     weather: dataItem.weather.map(item => {
//                             return{id: item.id,
//                                 main: item.main,
//                                 description: item.description,
//                                 icon: item.icon,}               
//                         }),
//                     city: cityId
//                 });

//                 await historicalWeather.save();
//                 console.log(chalk.blueBright('Nouvel enregistrement inséré dans la base de données.'));
//             }else{
//                 console.log(chalk.bgGray('existing record', existingRecord))
//             }
//         }))
//     }))
// }


//============================================

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

    console.log("weather service current", response.data)

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
  .sort({ "dt": 1 })

    return response.data; 
}

