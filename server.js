/**express*/
import express from 'express';
/**cors restrictions*/
import cors from 'cors';

import cookieParser from 'cookie-parser';

import dotenv from "dotenv";
/**json parser*/
import bodyParser from 'body-parser';
/**variable of environnement*/
 import "dotenv/config.js";

/**mongo db*/
import mongoose from 'mongoose';
import MongoDBClient from './db.js';

/**routes */
import router from './router/index.js';
import { errorMiddleware } from './middlewares/error-middleware.js';

const PORT = process.env.SERVER_PORT || 18500;
const {SERVER_HOST, HOST, CLIENT_URL, CLIENT_PORT} = process.env;

const app = express();
dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: `http://${HOST}:${CLIENT_PORT}` //react runs in 3000
}));

app.use('/api', router);

app.use(errorMiddleware);
const start = async() => {
     try{
       
        app.listen(PORT, () => {
            console.log(`✅SERVER ready on : http://${SERVER_HOST}:${PORT}`); 
        })
        MongoDBClient.initialize()
     }catch(err){
        
     }

}

start();

