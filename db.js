import mongoose from 'mongoose';

const URI = `${process.env.URI_MONGO}${process.env.DB_NAME}`;
const DB_NAME = `${process.env.DB_NAME}`;



const MongoDBClient = {
    initialize: () => {
        try {
            const client =  mongoose.connect(URI, 
                { 
                    useNewUrlParser: true, 
                    useUnifiedTopology: true
                })
            client.then(() => console.log(`🎉 🎉 successfully connected to DB: ${DB_NAME}`))
        } catch(err) {
            throw Error(err)
        }
    }
}

export default MongoDBClient;

