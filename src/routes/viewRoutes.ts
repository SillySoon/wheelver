// src/routes/viewRoutes.ts
import { Router } from "express";
import { isAuthenticated, isOwner, isCollectionOwner } from "../middleware/authMiddleware";
import * as UserService from "../services/userService";
import * as CollectionService from "../services/collectionService";
import * as HotwheelService from "../services/hotwheelService";
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

router.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
        const user = (req.user as any).toObject(); // Convert Mongoose document to plain object
        if (!user) {
            return res.redirect("/login"); // Should not happen with isAuthenticated, but as a safeguard
        }
        console.log("Dashboard user object:", user);

        const collections = await CollectionService.getCollections({ owner: user._id });

        const collectionsWithCountAndImages = [];
        for (const collection of collections) {
            const totalCount = collection.hotwheels ? collection.hotwheels.length : 0;
            await collection.populate({
                path: 'hotwheels',
                options: { limit: 4 }
            });
            const collectionObj = collection.toObject() as any;
            collectionObj.totalHotwheelsCount = totalCount;
            collectionsWithCountAndImages.push(collectionObj);
        }

        res.render("site/dashboard", { user, collections: collectionsWithCountAndImages, error: null });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).render("site/dashboard", { user: req.user, collections: [], error: "Failed to load dashboard data." });
    }
});

router.get("/dashboard/u/:id", isOwner, (req, res) => {
    res.render("site/dashboard_user");
});

router.get("/dashboard/c/:id", isCollectionOwner, async (req, res) => {
    const collectionId: string  = req.params.id as string;

    if (!isValidObjectId(collectionId)) {
        return res.status(400).render("site/dashboard_collection", { error: "Invalid Collection ID", collection: null });
    }

    try {
        const collection = await CollectionService.getCollection(collectionId);
        if (!collection) {
            return res.status(404).render("site/dashboard_collection", { error: "Collection not found", collection: null });
        }

        res.render("site/dashboard_collection", { collection, error: null });
    } catch (error) {
        console.error("Error loading dashboard collection:", error);
        res.status(500).render("site/dashboard_collection", { error: "Failed to load collection for editing", collection: null });
    }
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
        const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.render("site/user", { user, collections: collectionsWithCount, error: null, currentUrl });
    } catch (error) {
        res.status(500).render("site/user", { error: "Failed to load user profile", user: null, collections: [] });
    }
});

router.get("/c/:id", async (req, res) => {
    const collectionId = req.params.id;

    if (!isValidObjectId(collectionId)) {
        return res.status(400).render("site/collection", { error: "Invalid Collection ID", collection: null });
    }

    try {
        const collection = await CollectionService.getCollection(collectionId);
        if (!collection) {
            return res.status(404).render("site/collection", { error: "Collection not found", collection: null });
        }

        const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.render("site/collection", { collection, error: null, currentUrl });
    } catch (error) {
        console.error("Error loading collection:", error);
        res.status(500).render("site/collection", { error: "Failed to load collection", collection: null });
    }
});

router.get("/hw/:id", async (req, res) => {
    const hotwheelId = req.params.id;

    if (!isValidObjectId(hotwheelId)) {
        return res.status(400).render("site/hotwheel", { error: "Invalid Hotwheel ID", hotwheel: null });
    }

    try {
        const hotwheel = await HotwheelService.getHotwheel(hotwheelId);
        if (!hotwheel) {
            return res.status(404).render("site/hotwheel", { error: "Hotwheel not found", hotwheel: null });
        }

        res.render("site/hotwheel", { hotwheel, error: null });
    } catch (error) {
        console.error("Error loading hotwheel:", error);
        res.status(500).render("site/hotwheel", { error: "Failed to load hotwheel", hotwheel: null });
    }
});

export default router;
