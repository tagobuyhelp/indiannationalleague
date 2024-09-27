import express, { request, Router } from 'express';
import cors from 'cors';
import cookiesParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';







const app = express();

app.use(cors());

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