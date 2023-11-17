//data transfer objects
class UserFullDto  {
     id;
     email;
     isActivated;
     createdDateTime;
     bookmarks;
     preferences;
     role;
      constructor(model){
        this.id = model._id;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.createdDateTime = model.createdDateTime;
        this.bookmarks = model.bookmarks;
        this.preferences = model.preferences;
        this.role = model.role;
      }
}

export default UserFullDto;