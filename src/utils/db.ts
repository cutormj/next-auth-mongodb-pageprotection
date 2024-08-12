// import mongoose from "mongoose";

// const connect = async () => {
//   if (mongoose.connections[0].readyState) return;

//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Mongo Connection successfully established.");
//   } catch (error) {
//     throw new Error("Error connecting to Mongoose");
//   }
// };

// export default connect;


import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || {conn: null, promise: null};

export const connectToDatabase = async () => {
    if(cached.conn) return cached.conn;

    if (!MONGODB_URI)  throw new Error('MONGODB_URI is missing');

    cached.promise = cached.promise || mongoose.connect(MONGODB_URI,{
        dbName: 'learnnextjsdb',
        bufferCommands: false,
    })

    cached.conn = await cached.promise;

    return cached.conn;

}