import  {Schema, model} from 'mongoose';

const UserSchema = new Schema({
    email: {type: String, unique: true, lowercase: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},

    firstName: {type: String, trim: true, lowercase: true, required: true},
    lastName: {type: String, trim: true,lowercase: true, trim: true,required: true},
    createdDateTime: {type: Date, required: true},
    role: {type: String, required: true, default: 'user'},
    bookmarks: [
        {
            city: {type: Schema.Types.ObjectId, ref: 'City'}, 
            isFollowHistory: {type: Boolean, default: false},
            isActive:  {type: Boolean, default: false},
        } 
    ],
    preferences:{
        theme: {type: String, required: true,  default: 'day'},
        language: {type: String, required: true,  default: 'en'}
    }
}
, {collection: "user"})

const UserModel = model("User", UserSchema);

export default UserModel;
