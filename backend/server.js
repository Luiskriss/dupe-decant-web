require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {Pool} = require("pg");

const app = express();
app.use(cors());

const pool = new Pool ({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

app.get("/api/fragancias", async function (req, res) {
    try {
        const resultado = await pool.query("SELECT id_fragancia, nombre_fragancia, marca_fragancia FROM fragancias ORDER BY id_fragancia");
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener las fragancias:", error);
        res.status(500).json({ error: "Error al leer la base de datos" });
    }
});

app.get("/api/envases", async function (req, res) {
    try {
        const resultado = await pool.query("SELECT id_envases, dimension_envases, precio FROM envases ORDER BY id_envases");
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al leer la base de datos" });
    }   
});

app.listen(3000, function () {
    console.log("Servidor en https://localhost:3000");
});
