import express, { Express } from "express";
import apiRoutes from "./routes/apiRoutes";
import viewRoutes from "./routes/viewRoutes";
import path from "path";
import cors from "cors";
import helmet from "helmet";

const app: Express = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://static.wikia.nocookie.net"],
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join("public")));
app.use("/", viewRoutes);
app.use("/api", apiRoutes);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "views", "404", "index.html"));
});

export default app;
