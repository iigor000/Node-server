import express from "express";
import db from "./db.js"
const app = express();
const port = 8080;
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { response } from 'express';
import jwt from "jsonwebtoken";
import encodeJWT from "./jwt.js";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const jwtSecret = "dawj312uh3sjahi31";

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (err) {
        throw (err);
    }
}

async function authorizeUser(req, res) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return res.status(401).send("Authorization header missing");

    const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).send("Invalid token");

    try {
        const decoded = jsonwebtoken.verify(token, jwtSecret);
        res.locals.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return res.status(400).send("Invalid token");
    }
}

// GET
app.get('/users', async (req, res) => {
    try {
        const result = await db.pool.query("select * from user");
        res.status(200).send(result);
    } catch (err) {
        throw err;
    }
});

// POST
app.post('/users/register', async (req, res) => {
    let user = req.body;
    try {
        if (!user.email || !user.username || !user.password || !user.name) return res.status(500).send("Missing data");

        const existingUser = await db.pool.query("select * from user where email = ?", user.email);

        if (existingUser[0] != undefined) return res.status(400).send("User with this email adress already exists");

        const result = await db.pool.query("insert into user (email, username, password, name) values (?, ?, ?, ?)", [user.email, user.username, await hashPassword(user.password), user.name]).bodyParser;
        return res.status(200).send("Succesful register");

    } catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
});

app.post('/users/login', async (req, res) => {
    let user = req.body
    try {
        if (!user.email || !user.password) return res.status(500).send("Missing email or password")

        let userDb = await db.pool.query("select * from user where email = ?", user.email);

        if (userDb[0] == undefined) return res.status(500).send("User with this email doesn't exist");

        let hashedPassword = userDb[0].password;

        bcrypt.compare(user.password, hashedPassword, function (err, result) {
            if (result) {
                const token = encodeJWT({
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    id: user.id
                })

                return res.status(200).send(token);
            }

            else return res.status(400).send("Wrong password");
        });

    } catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
});

app.put('/tasks', async (req, res) => {
    let task = req.body;
    try {
        const result = await db.pool.query("update tasks set description = ?, completed = ? where id = ?", [task.description, task.completed, task.id]);
        res.send(result);
    } catch (err) {
        throw err;
    }
});

app.delete('/tasks', async (req, res) => {
    let id = req.query.id;
    try {
        const result = await db.pool.query("delete from tasks where id = ?", [id]);
        res.send(result);
    } catch (err) {
        throw err;
    }
});

app.listen(port, () => console.log(`Listening on port ${port}`));