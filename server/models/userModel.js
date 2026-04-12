import mongoose from "mongoose";

/**
 * User — core auth + profile only.
 *
 * Teammates and Invitations are now stored in their own
 * dedicated collections (Teammate, Invitation) for proper
 * status tracking and querying.
 *
 * The old embedded `teammates:[contactSchema]` and
 * `invitations:[String]` fields are intentionally removed
 * so the controller never writes stale data to this document.
 */
const userSchema = new mongoose.Schema({
  name:  { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Code repositories owned by this user
  repos:       [mongoose.Schema.Types.ObjectId],
  sharedRepos: [mongoose.Schema.Types.ObjectId],

  // Email verification
  verificationCode:       { type: String },
  verificationCodeExpiry: { type: Date },
  isVerified:             { type: Boolean, default: false },

  // Password reset
  resetPasswordToken:  { type: String },
  resetPasswordExpiry: { type: Date },
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
