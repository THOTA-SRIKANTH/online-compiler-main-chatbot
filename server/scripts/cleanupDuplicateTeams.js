/**
 * cleanupDuplicateTeams.js — run ONCE to fix mirror-duplicate teams.
 *
 * Old architecture created TWO teams per A↔B relationship:
 *   Team 1: owner=A, members=[B]
 *   Team 2: owner=B, members=[A]   ← redundant mirror
 *
 * This script uses Invitations as source of truth:
 *   - Sender becomes (or stays) the team OWNER
 *   - Receiver's mirror team is removed if it has no other unique members
 *
 * Usage:  node server/scripts/cleanupDuplicateTeams.js
 * Safe to run multiple times (idempotent).
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import Team       from "../models/teammateModel.js";
import Invitation from "../models/invitationModel.js";
import User       from "../models/userModel.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected:", mongoose.connection.name);

const accepted = await Invitation.find({ status: "accepted" }).lean();
console.log(`\nProcessing ${accepted.length} accepted invitation(s)...\n`);

for (const inv of accepted) {
  const senderUser   = await User.findById(inv.sender).lean();
  const receiverUser = await User.findById(inv.receiver).lean();
  if (!senderUser || !receiverUser) continue;

  // Ensure receiver is in the SENDER's team
  const senderTeam = await Team.findOneAndUpdate(
    { ownerId: inv.sender },
    {
      $setOnInsert: {
        teamName: `${senderUser.name || senderUser.email}'s Team`,
        ownerId:  inv.sender,
      },
      $addToSet: {
        members: { userId: inv.receiver, name: receiverUser.name || "", email: receiverUser.email },
      },
    },
    { upsert: true, new: true, sort: { createdAt: 1 } }
  );
  console.log(`  ✅ Ensured ${receiverUser.email} is in "${senderTeam.teamName}"`);

  // Find receiver-owned teams where the ONLY member is the sender → pure mirror → delete
  const mirrorCandidates = await Team.find({
    ownerId: inv.receiver,
    "members.userId": inv.sender,
  }).lean();

  for (const mirror of mirrorCandidates) {
    const others = mirror.members.filter(
      m => m.userId.toString() !== inv.sender.toString()
    );
    if (others.length === 0) {
      await Team.deleteOne({ _id: mirror._id });
      console.log(`  🗑️  Deleted mirror team "${mirror.teamName}"`);
    } else {
      console.log(`  ⚠️  Kept "${mirror.teamName}" — has ${others.length} other member(s)`);
    }
  }
}

// Deduplicate members inside every surviving team
const all = await Team.find({}).lean();
for (const t of all) {
  const seen = new Set();
  const unique = t.members.filter(m => {
    const k = m.userId.toString();
    return seen.has(k) ? false : (seen.add(k), true);
  });
  if (unique.length !== t.members.length) {
    await Team.updateOne({ _id: t._id }, { $set: { members: unique } });
    console.log(`  🔧 Deduped "${t.teamName}"`);
  }
}

const final = await Team.find({}).lean();
console.log("\n── Final state ──────────────────────────────────────────");
for (const t of final) {
  const owner = await User.findById(t.ownerId).select("email").lean();
  console.log(`  📁 "${t.teamName}" (owner: ${owner?.email}) → ${t.members.length} member(s)`);
  t.members.forEach(m => console.log(`       • ${m.name || m.email}  [${m.email}]`));
}
console.log(`\n✅ Done. ${final.length} team(s) remain.`);
await mongoose.disconnect();
process.exit(0);
