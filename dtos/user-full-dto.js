//data transfer objects
class UserFullDto  {
     _id;
     firstName;
     lastName;
     email;
     isActivated;
     activationLink;
     createdDateTime;
     bookmarks;
     preferences;
     role;
      constructor(model){
        this._id = model._id;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.activationLink = model.activationLink;
        this.createdDateTime = model.createdDateTime;
        this.bookmarks = model.bookmarks;
        this.preferences = model.preferences;
        this.role = model.role;
      }
}

export default UserFullDto;