import Mongoose from "mongoose";
import  {Schema, model} from 'mongoose';

const historicalWeatherSchema = new Schema(
    {
        dt: { type: Number, required: true }, //format unix
        main: {
          temp: {type: Number, required: true},
          feels_like: {type: Number, required: true},
          pressure: {type: Number, required: true},
          humidity: {type: Number, required: true},
          temp_min: {type: Number, required: true},
          temp_max: {type: Number, required: true}
        },
        wind: {
          speed: {type: Number, required: true},
          deg: {type: Number, required: true}
        },
        clouds: {
          all: {type: Number, required: true}
        },
        weather: [
          {
            id: {type: Number, required: true},
            main: {type: String, required: true},
            description:{type: String, required: true},
            icon: {type: String, required: true}
          }
        ],
        zip : {type: String},
        city: {type: Schema.Types.ObjectId, ref: 'City'},
    },
)
    

const historicalWeatherModel = model("historicalweather", historicalWeatherSchema);

export default historicalWeatherModel;