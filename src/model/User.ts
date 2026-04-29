import mongoose , {Schema,Document} from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document{
    username:string;
    email:string;
    password:string;
    refreshToken:string;
    isVerified:boolean;
    createdAt?:Date;
    updatedAt?:Date;
    comparePassword(password:string):Promise<boolean>;
    
}

const userSchema:Schema<IUser> = new Schema({

    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        select:false,
    },
    refreshToken:{
        type:String,
        default:"",
        select:false,
    },
    isVerified:{
        type:Boolean,
        default:false,
    }
},{timestamps:true})


userSchema.pre('save',async function():Promise<void>{
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword = async function(password:string):Promise<boolean>{
    return await bcrypt.compare(password,this.password);
}

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User",userSchema);
export default User;