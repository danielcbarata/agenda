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

app.get("/agenda", (req, res) => {
    try {
        client.query("SELECT * FROM Agenda", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get agenda");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/agenda/:id", (req, res) => {
    try {
        console.log("Chamou /:id " + req.params.id);
        client.query(
            "SELECT * FROM Agenda WHERE id = $1", [req.params.id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if (result.rowCount == 0) {
                    res.send("Nada encontrado no ID " + [req.params.id]);
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

app.delete("/agenda/:id", (req, res) => {
    try {
        console.log("Chamou delete /:id " + req.params.id);
        const id = req.params.id;
        client.query(
            "DELETE FROM Agenda WHERE id = $1",
            [id],
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

app.post("/agenda", (req, res) => {
    try {
        console.log("Chamou post", req.body);
        const { nome, telefone } = req.body;
        client.query(
            "INSERT INTO Agenda (nome, telefone) VALUES ($1, $2) RETURNING * ",
            [nome, telefone],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/agenda/:id", (req, res) => {
    try {
        console.log("Chamou update", req.body);
        const id = req.params.id;
        const { nome, email, altura, peso } = req.body;
        client.query(
            "UPDATE Agenda SET nome=$1, telefone=$2 WHERE id=$3", [nome, telefone, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ id: id });
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
