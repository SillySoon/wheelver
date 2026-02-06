import express, { Express } from "express";
import path from "path";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join("public")));

app.get("/", (req, res) => {
    res.json({ message: "Hello from Express + TypeScript!" });
});

export default app;
