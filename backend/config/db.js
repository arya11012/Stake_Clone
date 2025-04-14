const mongoose=require('mongoose')

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.mongo_url);
        console.log(`Connected to Mongodb Database ${mongoose.connection.host}`)
    }
    catch(error){
        console.log(`Mongo Connection Error ${error}`);

    }
}
module.exports={connectDB}