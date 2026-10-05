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
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import mongoose from "mongoose";
import { SESSION_SECRET, MONGODB_URI, IS_PRODUCTION, IS_TEST } from "./config/env";

const app: Express = express();

export const sessionStore = MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60, // 14 days
});

// Behind a reverse proxy in production; needed for secure cookies and correct client IPs
if (IS_PRODUCTION) {
    app.set("trust proxy", 1);
}

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https://static.wikia.nocookie.net", "https://cdn.discordapp.com"],
                "script-src": ["'self'"],
            },
        },
    }),
);
app.use(requestLogger);

// Liveness/readiness probe for Docker and load balancers
app.get("/healthz", (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(dbReady ? 200 : 503).json({ status: dbReady ? "ok" : "unavailable" });
});

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: IS_PRODUCTION,
            maxAge: 14 * 24 * 60 * 60 * 1000,
        },
    }),
);

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

// Resolves to <repo>/public from both src/ (dev) and dist/ (build)
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/", viewRoutes);
app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, skip: () => IS_TEST }), authRoutes);
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120, skip: () => IS_TEST }), apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
