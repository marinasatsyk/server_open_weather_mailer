//data transfer objects
class UserDto  {
    id;
    email;
    isActivated;
    role;
      constructor(model){
        this.id = model._id;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.role = model.role;
      }
}

export default UserDto;