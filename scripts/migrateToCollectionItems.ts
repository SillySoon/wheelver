/**
 * Migration: Discord-based users and one document per collected copy
 *
 * Users:
 *   Before: { username, isRegistered, createdAt }
 *   After:  { handle, displayName, previousHandles, createdAt, updatedAt }
 *   `handle` starts as the lowercased old username and is synced with Discord on the next login.
 *
 * Collections:
 *   Before: collections.hotwheels: [{ _id, hotwheel, collectedAt }, ...]
 *   After:  collectionitems: { _id, collectionId, hotwheel, owner, acquiredAt, createdAt, updatedAt }
 *   Entry ids are kept as item ids. Duplicate entries stay separate items (one per physical copy).
 *
 * Hotwheels:
 *   Empty `photoUrl: ""` values are removed.
 *
 * The script is idempotent and can be re-run safely.
 *
 * Run with:
 *   npx tsx scripts/migrateToCollectionItems.ts --dry-run
 *   npx tsx scripts/migrateToCollectionItems.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wheelver";
const DRY_RUN = process.argv.includes("--dry-run");

const log = (msg: string) => console.log(DRY_RUN ? `[DRY RUN] ${msg}` : msg);

async function migrateUsers(db: mongoose.mongo.Db) {
    const users = db.collection("users");
    const pending = await users.find({ handle: { $exists: false } }).toArray();
    log(`Users to migrate: ${pending.length}`);

    const taken = new Set(
        (
            await users
                .find({ handle: { $exists: true } })
                .project({ handle: 1 })
                .toArray()
        ).map((u) => u.handle),
    );

    for (const user of pending) {
        let handle = String(user.username || user.discordId).toLowerCase();
        if (taken.has(handle)) {
            // Fall back to the Discord ID; the real handle is set on the next login
            handle = String(user.discordId);
        }
        taken.add(handle);

        const update = {
            $set: {
                handle,
                displayName: user.username || user.discordId,
                previousHandles: [],
                updatedAt: user.createdAt ?? new Date(),
            },
            $unset: { username: "", isRegistered: "" },
        };

        log(`  user ${user._id}: "${user.username ?? "-"}" -> @${handle}`);
        if (!DRY_RUN) await users.updateOne({ _id: user._id }, update);
    }

    const indexes = await users.indexes();
    if (indexes.some((i) => i.name === "username_1")) {
        log("  dropping obsolete index users.username_1");
        if (!DRY_RUN) await users.dropIndex("username_1");
    }
}

async function migrateCollectionItems(db: mongoose.mongo.Db) {
    const collections = db.collection("collections");
    const items = db.collection("collectionitems");

    const pending = await collections.find({ hotwheels: { $exists: true } }).toArray();
    log(`Collections with embedded hotwheels: ${pending.length}`);

    let totalItems = 0;
    for (const col of pending) {
        const now = new Date();
        type LegacyEntry =
            | mongoose.Types.ObjectId
            | { _id: mongoose.Types.ObjectId; hotwheel: mongoose.Types.ObjectId; collectedAt?: Date };
        const docs = (col.hotwheels as LegacyEntry[]).map((entry) => {
            // Very old format stored plain ObjectIds instead of entry objects
            const isPlainId = entry instanceof mongoose.Types.ObjectId;
            const acquiredAt = (isPlainId ? null : entry.collectedAt) ?? col.createdAt ?? now;
            return {
                _id: isPlainId ? new mongoose.Types.ObjectId() : entry._id,
                collectionId: col._id,
                hotwheel: isPlainId ? entry : entry.hotwheel,
                owner: col.owner,
                acquiredAt,
                createdAt: acquiredAt,
                updatedAt: now,
            };
        });

        log(`  collection "${col.name}" (${col._id}): ${docs.length} item(s)`);
        totalItems += docs.length;
        if (DRY_RUN) continue;

        if (docs.length > 0) {
            await items.bulkWrite(
                docs.map((doc) => ({
                    updateOne: { filter: { _id: doc._id }, update: { $setOnInsert: doc }, upsert: true },
                })),
            );
        }

        // Only drop the embedded array once every entry exists as an item
        const migrated = await items.countDocuments({ _id: { $in: docs.map((d) => d._id) } });
        if (migrated !== docs.length) {
            throw new Error(`Collection ${col._id}: expected ${docs.length} items, found ${migrated}. Aborting.`);
        }
        await collections.updateOne({ _id: col._id }, { $unset: { hotwheels: "" } });
    }
    log(`Items created: ${totalItems}`);

    const missingUpdatedAt = await collections.countDocuments({ updatedAt: { $exists: false } });
    log(`Collections without updatedAt: ${missingUpdatedAt}`);
    if (!DRY_RUN && missingUpdatedAt > 0) {
        await collections.updateMany({ updatedAt: { $exists: false } }, [
            { $set: { updatedAt: { $ifNull: ["$createdAt", "$$NOW"] } } },
        ]);
    }
}

async function cleanupHotwheels(db: mongoose.mongo.Db) {
    const hotwheels = db.collection("hotwheels");
    const emptyPhotos = await hotwheels.countDocuments({ photoUrl: "" });
    log(`Hotwheels with empty photoUrl: ${emptyPhotos}`);
    if (!DRY_RUN && emptyPhotos > 0) {
        await hotwheels.updateMany({ photoUrl: "" }, { $unset: { photoUrl: "" } });
    }
}

async function migrate() {
    console.log(`Connecting to ${MONGODB_URI.replace(/\/\/[^@]*@/, "//***@")}...`);
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db!;
    console.log(`Connected to database "${db.databaseName}".${DRY_RUN ? " Dry run, nothing will be written." : ""}\n`);

    await migrateUsers(db);
    console.log();
    await migrateCollectionItems(db);
    console.log();
    await cleanupHotwheels(db);

    console.log("\nDone.");
    await mongoose.disconnect();
}

migrate().catch(async (err) => {
    console.error("Migration failed:", err);
    await mongoose.disconnect();
    process.exit(1);
});
