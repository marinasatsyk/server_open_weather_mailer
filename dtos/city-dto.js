//data transfer objects
export class CityDto  {
    id;
    name;
    lat; 
    lon;
    local_names;
    state;
    country;
      constructor(model){
        this.id = model._id;
        this.name= model.name;
        this.lat= model.lat; 
        this.lon= model.lon;
        this.local_names= model.local_names;
        this.state= model.state;
        this.country= model.country;
      }
}
