const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta estática
app.use(express.static(path.join(__dirname, 'templates')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// Conexión a MongoDB
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'cdlfDB';
const COLLECTION = 'usuarios';
let db;

MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () =>
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`)
    );
  })
  .catch(err =>
    console.error('❌ Error al conectar a MongoDB:', err)
  );

// Rutas
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'templates/pagina_principal.html'))
);

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await db
      .collection(COLLECTION)
      .find({}, { projection: { nombre: 1, edad: 1, _id: 0 } })
      .toArray();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar usuarios');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { nombre, contraseña } = req.body;
    const usuario = await db
      .collection(COLLECTION)
      .findOne({ nombre, contraseña });
    if (usuario) {
      res.send(`¡Bienvenido ${nombre}!`);
    } else {
      res.status(401).send('Credenciales incorrectas');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en servidor');
  }
});

app.post('/registro', async (req, res) => {
  try {
    const usuario = req.body;
    if (!usuario.nombre || !usuario.contraseña || !usuario.edad) {
      return res
        .status(400)
        .json({ error: 'Faltan campos obligatorios' });
    }
    const existe = await db
      .collection(COLLECTION)
      .findOne({ nombre: usuario.nombre });
    if (existe) {
      return res
        .status(400)
        .json({ error: 'El usuario ya existe' });
    }
    usuario.amigos = [];
    usuario.hobbys = usuario.hobbys || [];
    await db.collection(COLLECTION).insertOne(usuario);
    res.json({
      success: true,
      message: 'Usuario registrado con éxito'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en servidor' });
  }
});