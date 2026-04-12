/**
 * dropOwnerIndex.js
 * Run once to drop the old unique index on ownerId that prevented
 * a user from creating more than one team.
 *
 * Usage:  node server/scripts/dropOwnerIndex.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected:", mongoose.connection.name);

try {
    await mongoose.connection.collection("teams").dropIndex("ownerId_1");
    console.log("✅ Dropped old unique index 'ownerId_1'");
} catch (e) {
    if (e.codeName === "IndexNotFound") {
        console.log("ℹ️  Index 'ownerId_1' not found — nothing to drop (already clean)");
    } else {
        console.error("Error:", e.message);
    }
}

// Recreate as non-unique
await mongoose.connection.collection("teams").createIndex({ ownerId: 1 }, { unique: false });
console.log("✅ Recreated ownerId index as non-unique");

await mongoose.disconnect();
process.exit(0);