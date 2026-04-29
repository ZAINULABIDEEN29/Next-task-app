import mongoose, {Schema, Document} from "mongoose";


interface ITask extends Document{
    content:string;
    isCompleted:boolean;
    status: "todo" | "in progress" | "completed";
    priority:"high" | "medium" | "low";
    deadline?:Date;
    createdAt?:Date;
    updatedAt?:Date;
    author:mongoose.Types.ObjectId;
}

const taskSchema:Schema<ITask> = new Schema ({
    content:{
        type:String,
        required:[true,"Content is required"],
        trim:true,
    },
    isCompleted:{
        type:Boolean,
        default:false,
    },
    status:{
        type:String,
        enum:["todo","in progress","completed"],
        default:"todo",
    },
    priority:{
        type:String,
        enum:["high","medium","low"],
        default:"medium",
    },
    deadline:{
        type:Date,

    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true})

taskSchema.index({author:1,createdAt:1})

const Task = (mongoose.models.Task as mongoose.Model<ITask>) || mongoose.model<ITask>("Task",taskSchema);
export default Task;