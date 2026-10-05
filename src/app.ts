import express, { Express } from "express";
import apiRoutes from "./routes/apiRoutes";
import viewRoutes from "./routes/viewRoutes";
import authRoutes from "./routes/authRoutes";
import path from "path";
import helmet from "helmet";
import session from "express-session";
import { MongoStore } from "connect-mongo";
import { rateLimit } from "express-rate-limit";
import passport from "./config/passport";
import { csrfProtection } from "./middleware/csrf";
import { SESSION_SECRET, MONGODB_URI, IS_PRODUCTION } from "./config/env";

const app: Express = express();

// Behind a reverse proxy in production; needed for secure cookies and correct client IPs
if (IS_PRODUCTION) {
    app.set("trust proxy", 1);
}

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://static.wikia.nocookie.net", "https://cdn.discordapp.com"],
            "script-src": ["'self'"],
        },
    },
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: "sessions",
        ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: IS_PRODUCTION,
        maxAge: 14 * 24 * 60 * 60 * 1000,
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.user = req.user;
    // Separate name so views that pass their own `user` (e.g. profile pages) don't shadow the logged-in user
    res.locals.authUser = req.user || null;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join("public")));
app.use("/", viewRoutes);
app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120 }), apiRoutes);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).render("site/404");
});

export default app;
