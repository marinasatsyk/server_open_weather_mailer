import jwt from 'jsonwebtoken';
import { ApiError } from '../exceptions/api-error.js';

export const getId = (req, res, next) =>   {
    const {refreshToken} = req.cookies;

    if(!refreshToken){
      return next(ApiError.UnauthorizedError())
    }
    const decode = jwt.decode(refreshToken);
    console.log("DECODE refresh===>", decode)
    
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
      console.log("dateToTimestamp", dateString);
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

  // La méthode getTime() renvoie le timestamp en millisecondes, alors divisez par 1000 pour obtenir le timestamp Unix en secondes.
  return Math.floor(date.getTime() / 1000);
}  

export const  getUnixTimestampsYearRange = ()=> {
  // Date courante
  const currentDate = new Date();

  // Date d'il y a un an
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() + 1); // Ajoute un jour
  startDate.setFullYear(currentDate.getFullYear() - 1); // Soustrait un an
  startDate.setHours(0, 0, 0, 0); // Fixe l'heure à 00h00m00s

 // Conversion en timestamps Unix
 const startDateUnix = convertDateToUnixTimestamp(startDate);
 const endDateUnix = convertDateToUnixTimestamp(currentDate) ;

 return { startDate: startDateUnix, endDate: endDateUnix };
}

