import mongoose from "mongoose";

/**
 * Team model.
 *
 * Key rules:
 *  - A user can own MULTIPLE teams (no unique constraint on ownerId).
 *  - Team members do NOT need to be "connections" — anyone with an account
 *    can be added directly by email, like a WhatsApp group.
 *  - Pre-save hook deduplicates members so the same person is never listed twice.
 *
 * If you previously had a { ownerId: 1, unique: true } index in MongoDB,
 * run this once in mongo shell or Compass to drop it:
 *   db.teams.dropIndex("ownerId_1")
 * Or run:  node server/scripts/dropOwnerIndex.js
 */
const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, trim: true, maxlength: 80 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

// Fast lookups — NOT unique, one user can own many teams
teamSchema.index({ ownerId: 1 });
teamSchema.index({ "members.userId": 1 });

// Deduplicate members by userId on every save
teamSchema.pre("save", function (next) {
  const seen = new Set();
  this.members = this.members.filter((m) => {
    const key = m.userId.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  next();
});

const Team = mongoose.model("Team", teamSchema);
export default Team;