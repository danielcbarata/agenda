const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;

var client = new Client(conString);

client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Servidor disponível.");
});

app.get("/usuarios", (req, res) => {
    try {
        client.query("SELECT * FROM Usuarios", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get usuario");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/usuarios/:id_usuario", (req, res) => {
    try {
        console.log("Chamou /:id_usuario " + req.params.id_usuario);
        client.query(
            "SELECT * FROM Usuarios WHERE id_usuario = $1", [req.params.id_usuario],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if (result.rowCount == 0) {
                    res.send("Nada encontrado no ID " + [req.params.id_usuario]);
                }
                else {
                    res.send(result.rows);
                }
                //console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/usuarios/:id_usuario", (req, res) => {
    try {
        console.log("Chamou delete /:id_usuario " + req.params.id_usuario);
        const id_usuario = req.params.id_usuario;
        client.query(
            "DELETE FROM Agenda WHERE id_usuario = $1",
            [id_usuario],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(400).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/usuarios", (req, res) => {
    try {
        console.log("Chamou post", req.body);
        const { nome, telefone, horarios } = req.body;
        client.query(
            "INSERT INTO Usuarios (nome, telefone, horarios) VALUES ($1, $2, $3) RETURNING * ",
            [nome, telefone, horarios],
            function (err, result) {
                if (err) {
                    console.error("Erro ao executar a qry de INSERT", err);
                    res.status(400).json({ error: "Dados inválidos" });
                    return;
                }
                const { id_usuario } = result.rows[0];
                res.setHeader("id_usuario", `${id_usuario}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/usuarios/:id_usuario", (req, res) => {
    try {
        console.log("Chamou update", req.body);
        const id_usuario = req.params.id_usuario;
        const { nome, telefone, horarios } = req.body;
        client.query(
            "UPDATE Agenda SET nome=$1, telefone=$2, horarios=$3 WHERE id_usuario=$4", [nome, telefone, , horarios, id_usuario],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id_usuario", id_usuario);
                    res.status(202).json({ id_usuario: id_usuario });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});


app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 
