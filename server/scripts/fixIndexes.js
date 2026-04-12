/**
 * fixIndexes.js — run ONCE to fix MongoDB index issues.
 *
 * Drops problematic unique indexes from previous versions:
 *   teams.ownerId_1         (unique=true → must be non-unique for multiple teams)
 *   invitations.sender_1_receiver_1 (unique → replaced by status-aware logic)
 *
 * Usage:  node server/scripts/fixIndexes.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected:", mongoose.connection.name);

const db = mongoose.connection.db;

// ── Fix teams collection ─────────────────────────────────────────────────────
try {
    const teamIndexes = await db.collection("teams").indexes();
    for (const idx of teamIndexes) {
        // Drop any unique index on ownerId (from old architecture)
        if (idx.key?.ownerId === 1 && idx.unique) {
            await db.collection("teams").dropIndex(idx.name);
            console.log(`  🗑️  Dropped unique index "${idx.name}" from teams`);
        }
    }
    // Ensure plain (non-unique) index exists
    await db.collection("teams").createIndex({ ownerId: 1 }, { background: true });
    console.log("  ✅ teams.ownerId index is now non-unique");
} catch (e) { console.error("  teams index fix error:", e.message); }

// ── Fix invitations collection ────────────────────────────────────────────────
try {
    const invIndexes = await db.collection("invitations").indexes();
    for (const idx of invIndexes) {
        if (idx.key?.sender === 1 && idx.key?.receiver === 1 && idx.unique) {
            await db.collection("invitations").dropIndex(idx.name);
            console.log(`  🗑️  Dropped unique index "${idx.name}" from invitations`);
        }
    }
    // Ensure compound index without unique constraint
    await db.collection("invitations").createIndex({ sender: 1, receiver: 1, status: 1 }, { background: true });
    console.log("  ✅ invitations compound index rebuilt (non-unique)");
} catch (e) { console.error("  invitations index fix error:", e.message); }

console.log("\n✅ Index fix complete. You can now create multiple teams per user.");
await mongoose.disconnect();
process.exit(0);
