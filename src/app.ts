import express, { Express } from "express";
import apiRoutes from "./routes/apiRoutes";
import viewRoutes from "./routes/viewRoutes";
import authRoutes from "./routes/authRoutes";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import passport from "./config/passport";
import { SESSION_SECRET } from "./config/env";

const app: Express = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://static.wikia.nocookie.net", "https://cdn.discordapp.com"],
            "script-src": ["'self'"],
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join("public")));
app.use("/", viewRoutes);
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "views", "404", "index.html"));
});

export default app;
