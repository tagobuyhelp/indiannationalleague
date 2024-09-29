import dotenv from 'dotenv';
import connectDB from './database/mongoConnection.js';
import { app } from './app.js';
import transporter from './mail/mail.connect.js';



dotenv.config({
    path: "../.env"
})


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server started on port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });
