import express, { request, Router } from 'express';
import cors from 'cors';
import cookiesParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';
import path from 'path';
// import { generateIdCard } from './utils/generateIdCard.js';



// // Example usage
// generateIdCard(
//     'Tarik Aziz',
//     'INL373334',
//     '01/01/1980',
//     'Regular',
//     '01/01/2025',
//     'A:/Development/indiannationalleague/Server/images/TARIK.jpg',
// );




const app = express();


// CORS configuration
app.use(cors({
    origin: ['https://delightful-kulfi-d6734f.netlify.app', 'https://admin.indiannationalleague.party', 'http://localhost:5173', 'http://127.0.0.1:5500', 'https://indiannationalleague.party', 'https://delightful-kulfi-d6734f.netlify.app'], // Adjust origins as needed
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));




// Middleware configuration
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use(cookiesParser());





app.get('/', (req, res) => {
    res.send('Welcome Indian National League')
})


//import routes
import userRouter from './routes/user.routes.js';
import donationRouter from './routes/donation.routes.js';
import phonepeRoutes from './routes/phonepe.routes.js';
import membershipRoutes from './routes/membership.routes.js';
import memberRoutes from './routes/member.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import noticeRoutes from './routes/notice.routes.js';
import countryRoutes from './routes/country.routes.js';
import stateRoutes from './routes/state.routes.js';
import districtRoutes from './routes/district.routes.js';
import parliamentConstituencyRoutes from './routes/parliamentConstituency.routes.js';
import authRoutes from './routes/auth.routes.js';
import statisticsRoutes from './routes/statistics.routes.js';


//route diclaration
app.use("/user", userRouter);
app.use(donationRouter);
app.use(phonepeRoutes);
app.use(membershipRoutes);
app.use("/member", memberRoutes);
app.use(transactionRoutes);
app.use(noticeRoutes);
app.use(countryRoutes);
app.use(stateRoutes);
app.use(districtRoutes);
app.use(parliamentConstituencyRoutes);
app.use(authRoutes)
app.use('/statistics', statisticsRoutes);



export {app}