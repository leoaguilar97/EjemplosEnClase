// Requerir DOTENV que carga la configuracion que tenemos en el archivo .env en el directorio principal
// Aca se pueden definir todas las variables de entorno
require('dotenv').config(); //npm i dotenv

// Modulos instalados 
const express = require('express'); // npm i express
//const axios = require('axios'); // npm i axios



const fs = require('fs'); // Este modulo viene cargado directamente en nodejs, sirve para trabajar con archivos
const { getHtmlList } = require('./templates'); // Modulo cargado en templates.js, getHtmlList se utiliza para generar una lista en HTML

// Configuraremos una variable de entorno unicamente en nuestro server de PRUEBAS (en mi caso, en mi computadora Windows)
// El server no tendra esta variable, por lo tanto SI leeremos el archivo proc
const isTesting = process.env.TESTING === "true";

// Aca es donde se lee el modulo kernel que cargamos!
const getTimestamp = () =>
    (fs.readFileSync('/elements/procs/timestamps', 'utf8')).toString(); // Este metodo va a leer la carpeta /proc/timestamps y convierte sus datos a un string.

// Este metodo sirve para devolver la informacion que hay en el modulo
// En caso la lectura no pueda ser efectuada, devolvemos un error!
// Esto es util ya que el server entocnces no se caera cada vez que requiramos la lectura y no tengamos bien el modulo
const safeGetTimestamp = () => {

    // si estamos en nuestra computadora local, sin el modulo instalado, enviamos nuestra hora actual
    if (isTesting) {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    // Intentamos hacer la lectura del archivo /proc/timestamps
    try {
        // Si todo es correcto, lo devolveremos
        return getTimestamp();
    }
    // Deconstruimos el objeto error en el catch, y obtenemos unicamente su valor
    catch ({ message }) {
        // En dado caso haya un error, devolveremos el error.
        return `No se pudo leer el modulo. ${message}`;
    }
};

const app = new express(); // Crear una API express

// Habilitamos los CORS
app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// IMPORTANTE! Le decimos a express que necesitamos trabajar con intercambio de datos JSON
app.use(express.json({ extended: true }))

// Con esta ruta traeremos todos los datos del modulo
// Luego devolveremos un HTML para mostrarlo todo en una lista
app.get('/', async (req, res) => { // es importante notar que este es un metodo async, ya que utilizamos await dentro de el

    // Intentamos realizar el get al otro servidor
    try {
        const html = getHtmlList([{ name: "Leo", msg: "SO1", timestamp: safeGetTimestamp() }]); // Obtenemos la lista con un formato de lista de HTML
        return res.send(html); // Devolvemos el HTML para que sea renderizado por el navegador
    }
    catch (error) {
        console.log(`Server1: Error en la peticion, error: ${error.message}`);
        return res.status(500).send({ msg: error.message }); // Existio un error, devuelve el mensaje del error
    }
});

// Si existe un puerto en la configuracion, la cargamos; de lo contrario se inicia en el puerto 4000
const PORT = process.env.port || 4000;

// Iniciar la API en el puerto que definimos, mostrar en consola que ya esta funcionando.
app.listen(PORT, () => { console.log(`API lista en -> http://localhost:${PORT}`) });






