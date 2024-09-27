import express, { request, Router } from 'express';
import cors from 'cors';
import cookiesParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';







const app = express();


// Define allowed origins
const allowedOrigins = [
    'http://157.173.216.224',
    'http://127.0.0.1:5500',
    'http://localhost:4055',
    'https://secure.indiannationalleague.party',
    'https://api.indiannationalleague.party/',
    '62.72.59.121',
];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        console.log('Request Origin:', origin);
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};


app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));
app.use(cookiesParser());
app.use(errorMiddleware);



app.get('/', (req, res) => {
    res.send('Welcome Indian National League')
})


//import routes
import userRouter from './routes/user.routes.js';
import donationRouter from './routes/donation.routes.js';
import phonepeRoutes from './routes/phonepe.routes.js';


//route diclaration
app.use("/user", userRouter);
app.use(donationRouter);
app.use(phonepeRoutes);



export { app }