import mongoose from "mongoose";

let cached = (global as any).mongoose || {conn: null, promise: null};

export default async function connectDB(){
    if(cached.conn) return cached.conn;
    if(!cached.promise){
        if(!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => mongoose);
    }
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
    return cached.conn
}