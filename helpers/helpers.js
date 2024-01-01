import jwt from 'jsonwebtoken';
import { ApiError } from '../exceptions/api-error.js';
import historicalWeatherModel from '../models/historical-weather-model.js';

export const getId = (req, res, next) =>   {
    const {refreshToken} = req.cookies;

    if(!refreshToken){
      return next(ApiError.UnauthorizedError())
    }
    const decode = jwt.decode(refreshToken);
    console.log("📞decode token", decode)
    const id = decode.id;
    return id;
}


export function convertUNIXtoISO(timestampUnix) {
  if (!timestampUnix || !isValidTimestamp(timestampUnix)) return;
  const date = new Date(timestampUnix * 1000); 
  
  const timeZoneOffsetInMinutes = date.getTimezoneOffset();
  
  date.setMinutes(-timeZoneOffsetInMinutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  const dateISO = date.toISOString();
    return dateISO
}
  
        
function isValidTimestamp(date) {
    return new Date(date).getTime() > 0;
}
  
  
export function dateToTimestamp(dateString) {
      const [day, month, year] = dateString.split('/').map(Number);
    
      const date = new Date(`${year}-${month}-${day}`);
    
      const timestampUnix = date.getTime() / 1000;
    
      return timestampUnix;
}
  
export function getTomorrowDate(dateString) {
      const [day, month, year] = dateString.split('/').map(Number);
    
      const date = new Date(`${year}-${month}-${day}`);
    
      date.setDate(date.getDate() + 1);
    
      const tomorrowDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    
      return tomorrowDate;
}

export const getFullYearRange = () => {
  const start = new Date
}

export function convertDateToUnixTimestamp(date) {
  if (!date || !(date instanceof Date)) {
    console.error("Invalid date object");
    return null;
  }

  return Math.floor(date.getTime() / 1000);
}  


export const  getUnixTimestampsYearRange = async(cityId)=> {
  //search if there is record for the City
  const mostRecentDocument = await historicalWeatherModel
      .findOne({city: cityId})
      .sort({ dt: 'desc' }) // Trie par ordre décroissant sur le champ dt
      .exec();

  let startDateUnix;
  
  //todaty part
  const currentDate = new Date();
  const todayDate = new Date(currentDate);

  if(mostRecentDocument){
    //start
    startDateUnix = mostRecentDocument.dt;
  }else{
    //start date: today +1d - 1y
    todayDate.setDate(currentDate.getDate() + 1); // Add 1d
    todayDate.setFullYear(currentDate.getFullYear() - 1); // substract 1 year
    todayDate.setHours(0, 0, 0, 0); // Fixe time  00h00m00s
   
    // Conversion in timestamps Unix
    startDateUnix = convertDateToUnixTimestamp(todayDate);
  }

  //end date is allways today
  const endDateUnix = convertDateToUnixTimestamp(currentDate);

  return {  startDateUnix,  endDateUnix };
}

