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


const PORT = process.env.SERVER_PORT;
const {SERVER_HOST,  CLIENT_URL, NODE_ENV} = process.env;

const URI = `${process.env.URI_MONGO}${process.env.DB_NAME}`;
const DB_NAME = `${process.env.DB_NAME}`;

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
    //dev
    // origin: `http://localhost:3000` 
   //prod
    origin: `${CLIENT_URL}` 
}));

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser());

// app.use(cors());
// app.options('*', cors());

// const baseUrl = NODE_ENV === "dev" ? "/app" : '/openweatherapp';

app.use('/openweatherapp', router);

app.use(errorMiddleware);

const start = async() => {
    
    try{
       
        const client =  mongoose.connect(URI, 
            { 
                useNewUrlParser: true, 
                useUnifiedTopology: true
            })
       
        client.then(() => {
            console.log(`🎉 🎉 successfully connected to DB: ${DB_NAME}`)
           
            app.listen(PORT, () => {
                    console.log(`✅SERVER ready on : ${SERVER_HOST === "localhost" ? "http" :"https"}://${SERVER_HOST}:${PORT}`); 
            })
        })
     }catch(err){
        console.error('Erreur de connexion ', err.message); }
}

start();

