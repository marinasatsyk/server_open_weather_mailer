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

const PORT = process.env.SERVER_PORT || 5000;
const HOST = process.env.SERVER_HOST;


const app = express();
dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(cors());

app.use('/api', router);

const start = async() => {
     try{
       
        app.listen(process.env.SERVER_PORT, () => {
            console.log(`✅SERVER ready on : http://${HOST}:${PORT}`); 
        })
        MongoDBClient.initialize()
     }catch(err){
    
     }

}

start();

