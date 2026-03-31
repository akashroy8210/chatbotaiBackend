import mongoose from "mongoose"

const connectionDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB successfully connected")
    }catch(error){
        console.log(error)
    }
}

export default connectionDB