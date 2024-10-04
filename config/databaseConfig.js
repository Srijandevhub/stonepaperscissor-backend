const mongoose = require('mongoose');
const databaseConfig = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Database connected at ${mongoose.connection.port}`);
    } catch (error) {
        console.log(error);
    }
};
module.exports = { databaseConfig };