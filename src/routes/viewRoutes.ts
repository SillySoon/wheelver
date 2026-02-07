// src/routes/viewRoutes.ts
import { Router } from "express";
import { isAuthenticated, isOwner, isCollectionOwner } from "../middleware/authMiddleware";
import * as UserService from "../services/userService";
import * as CollectionService from "../services/collectionService";
import { isValidObjectId } from "../utils/validation";

const router: Router = Router();

router.get("/", async (req, res) => {
    const search = req.query.search as string;
    let users: any[] = [];
    if (search && search.trim().length >= 2) {
        try {
            users = await UserService.getUsers(search);
            users = users.slice(0, 5);
        } catch (error) {
            console.error("Home search error:", error);
        }
    }
    res.render("site/home", { users, search: search || "" });
});

router.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("site/dashboard");
});

router.get("/dashboard/u/:id", isOwner, (req, res) => {
    res.render("site/dashboard_user");
});

router.get("/dashboard/c/:id", isCollectionOwner, (req, res) => {
    res.render("site/dashboard_collection");
});

router.get("/u/:id", async (req, res) => {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
        return res.status(400).render("site/user", { error: "Invalid User ID", user: null, collections: [] });
    }

    try {
        const user = await UserService.getUser(userId);
        if (!user) {
            return res.status(404).render("site/user", { error: "User not found", user: null, collections: [] });
        }

        const collections = await CollectionService.getCollections({ owner: userId });
        // Populate hotwheels to get images for the cards, but keep track of the total count
        const collectionsWithCount = [];
        for (const collection of collections) {
            const totalCount = collection.hotwheels ? collection.hotwheels.length : 0;
            await collection.populate({
                path: 'hotwheels',
                options: { limit: 4 }
            });
            const collectionObj = collection.toObject() as any;
            collectionObj.totalHotwheelsCount = totalCount;
            collectionsWithCount.push(collectionObj);
        }
        res.render("site/user", { user, collections: collectionsWithCount, error: null });
    } catch (error) {
        res.status(500).render("site/user", { error: "Failed to load user profile", user: null, collections: [] });
    }
});

router.get("/c/:id", (req, res) => {
    res.render("site/collection");
});

router.get("/hw/:id", (req, res) => {
    res.render("site/hotwheel");
});

export default router;
