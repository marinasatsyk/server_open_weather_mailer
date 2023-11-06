import  {Schema, model} from 'mongoose';

const CitySchema = new Schema({ 
        name: {type: String, required: true},
        local_names: {type: Object},
        lat: {type: Number, required: true},
        lon: {type: Number, required: true},
        country: {type: String, required: true},
        zip : {type: String, required: true},
        insee: {type: String},
        isHistory: {type: Boolean, default: false},
    })


const CityModel = model("City", CitySchema);

export default CityModel;
