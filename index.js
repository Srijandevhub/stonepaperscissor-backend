const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv");
const path = require('path');
const cookieParser = require('cookie-parser');
const { databaseConfig } = require('./config/databaseConfig');
dotenv.config();
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3001" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/api/v1/users/", require('./routes/userRoute'));
app.use("/api/v1/notifications/", require('./routes/notificationRoute'));
app.use("/api/v1/games/", require('./routes/gameRoute'));
databaseConfig(process.env.URI);
app.listen(process.env.PORT, () => {
    console.log(`Server Stated at ${process.env.PORT}`);
});