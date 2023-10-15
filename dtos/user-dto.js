//data transfer objects
class UserDto  {
     email;
     id;
     isActivated;
      constructor(model){
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
      }
}

export default UserDto;