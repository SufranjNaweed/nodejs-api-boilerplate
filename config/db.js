const mongoose = require('mongoose');
const config = require('config');
const gravatar = require('gravatar');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser : true,
            useCreateIndex : true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log('MongoDB Connected');
    }
    catch(err){
        console.log(err);
        // exit the process
        process.exit(1);
    }
}

module.exports = connectDB;