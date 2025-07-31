import mongoose from "mongoose";

export const connectDb = async () => {
    try{
        const mongo_uri = process.env.MONGO_URI;
        const conn = await mongoose.connect(mongo_uri!);
        console.log('MongoDB connected: ' + conn.connection.host);
    }catch(err){
        console.log(err);
    }
}