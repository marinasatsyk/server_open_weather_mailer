import { CityDto } from "../dtos/city-dto";
import CityModel from "../models/city-model";

export const createCity =  async(req, res, next) =>  {
    const city = req.body.city;

    const {name, lat, lon, local_names, state, country} = city;

    

    const candidate = await CityModel.findOne({lat, lon});

    if(candidate){
        console.error('city exists');
        return;
    }


    const cityDoc = await CityModel.create({
        name: city.name,
        lat: city.lat, 
        lon: city.lon,
        local_names: city.local_names,
        state: city.state,
        country: city.country,
    });







    try{
        // const users = await userService.getAllUsers();
        // return res.json(users)

    }catch(err){
        next(err)
    }
}


