import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

type ConnectionObject = {
    isConnected?:number;
}

const connection: ConnectionObject = {}


const dbConnect = async ():Promise<void> =>{
    if (connection.isConnected){
        console.log("Already connected to MongoDB")
        return 
    }
    try{
        const db = await mongoose.connect(MONGO_URI as string)
        connection.isConnected = db.connections[0].readyState
        console.log("connected")
    } catch(err){
        console.log("Error connecting to MongoDB",err)
        // process.exit(1)
    }
}

export default dbConnect;
