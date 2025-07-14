const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;

// URL y nombre de la base de datos
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'cdlfDB';
const COLLECTION = 'usuarios';

let db;

// Middleware para servir archivos estáticos desde la carpeta "templates"
app.use(express.static(path.join(__dirname, 'templates')));

// Ruta para servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/pagina_principal.html'));
});

// Endpoint para obtener usuarios desde MongoDB
app.get('/usuarios', async (req, res) => {
    try {
        //const db = client.db(DB_NAME);
        const usuarios = await db.collection(COLLECTION)
            .find({}, { projection: { nombre: 1, edad: 1, _id: 0 } })
            .toArray();

        console.log("Usuarios encontrados:", usuarios);  // Debug
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).send("Error al consultar usuarios");
    }
});

// Conexión a MongoDB y arranque del servidor
MongoClient.connect(MONGO_URL)
    .then((client) => {
        db = client.db(DB_NAME);
        console.log('✅ Conectado a MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Error al conectar a MongoDB:', err);
    });
