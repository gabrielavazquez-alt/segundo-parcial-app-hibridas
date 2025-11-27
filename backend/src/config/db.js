const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME;
console.log('MONGO_URI existe?', !!process.env.MONGODB_URI);


let client;
let db;

async function connectDB() {
    try {
        if (db) {
            return db;
        }

        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);

        console.log(`✅ Conectado a MongoDB: ${dbName}`);
        return db;
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1); 
    }
}


function getDb() {
    if (!db) {
        throw new Error('La base de datos no está inicializada. Llamá primero a connectDB().');
    }
    return db;
}

module.exports = {
    connectDB,
    getDb,
};
