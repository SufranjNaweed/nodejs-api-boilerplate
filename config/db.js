const mongoose = require('mongoose');
const db = process.env.DB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser : true,
            useCreateIndex : true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        await console.log('MongoDB Connected');
    }
    catch(err){
        console.log(err);
        // exit the process
        process.exit(1);
    }
}

module.exports = connectDB;