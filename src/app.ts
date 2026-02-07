import express, { Express } from "express";
import apiRoutes from "./routes/apiRoutes";
import path from "path";
import cors from "cors";
import helmet from "helmet";

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join("public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/u/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "u", "index.html"));
});
app.get("/c/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "c", "index.html"));
});
app.use("/api", apiRoutes);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "views", "404", "index.html"));
});

export default app;
