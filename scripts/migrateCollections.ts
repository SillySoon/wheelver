/**
 * Migration: Convert hotwheels from plain ObjectId array to entry subdocuments
 *
 * Before: hotwheels: [ObjectId, ...]
 * After:  hotwheels: [{ hotwheel: ObjectId, collectedAt: Date }, ...]
 *
 * The collectedAt date is set to the collection's createdAt timestamp.
 *
 * Run with:
 *   npx tsx scripts/migrateCollections.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wheelver";

async function migrate() {
    console.log(`Connecting to ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const db = mongoose.connection.db!;
    const collectionsCol = db.collection("collections");

    const allCollections = await collectionsCol.find({}).toArray();
    console.log(`Found ${allCollections.length} collection(s) to inspect.`);

    let migrated = 0;
    let skipped = 0;

    for (const col of allCollections) {
        if (!col.hotwheels || col.hotwheels.length === 0) {
            skipped++;
            continue;
        }

        // Already migrated: first entry is an object with a `hotwheel` field
        const first = col.hotwheels[0];
        if (first !== null && typeof first === "object" && !mongoose.Types.ObjectId.isValid(first)) {
            console.log(`  [SKIP] collection "${col.name}" (${col._id}) - already migrated`);
            skipped++;
            continue;
        }

        const collectedAt: Date = col.createdAt instanceof Date ? col.createdAt : new Date(col.createdAt ?? Date.now());

        const newHotwheels = (col.hotwheels as mongoose.Types.ObjectId[]).map((hwId) => ({
            _id: new mongoose.Types.ObjectId(),
            hotwheel: hwId,
            collectedAt,
        }));

        await collectionsCol.updateOne({ _id: col._id }, { $set: { hotwheels: newHotwheels } });

        console.log(
            `  [MIGRATED] collection "${col.name}" (${col._id}) - ${newHotwheels.length} hotwheel(s), collectedAt=${collectedAt.toISOString()}`,
        );
        migrated++;
    }

    console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
    await mongoose.disconnect();
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
