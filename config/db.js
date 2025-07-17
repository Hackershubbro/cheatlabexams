const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL + process.env.DATABASE_NAME)
.then(()=>{
    console.log("Connected to database")
}).catch((err)=>{
    console.log("Error connecting to database")
})