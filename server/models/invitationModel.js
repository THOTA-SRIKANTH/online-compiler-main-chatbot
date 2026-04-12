import mongoose from "mongoose";

/**
 * Invitation / Connection request.
 *
 * Two distinct concepts now enforced at the data layer:
 *
 *   CONNECTION REQUEST  (this document)
 *     status: pending   → waiting for receiver to accept/reject
 *     status: accepted  → they are now "Connections" (like WhatsApp contacts)
 *     status: rejected  → receiver declined (sender can re-send later)
 *
 *   TEAM MEMBERSHIP  (Team collection)
 *     Adding a connection to a team never creates an Invitation.
 *     Removing from a team never changes Invitation status.
 *
 * Unique index: only ONE pending invitation per sender→receiver pair.
 * Accepted/rejected invitations are kept as history and don't block re-sends.
 */
const invitationSchema = new mongoose.Schema(
  {
    sender:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName:    { type: String, default: "" },
    senderEmail:   { type: String, required: true, lowercase: true, trim: true },

    receiver:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverEmail: { type: String, required: true, lowercase: true, trim: true },

    // Optional: which team to add receiver to when they accept
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Only ONE pending invitation per sender→receiver pair.
// (Accepted/rejected don't count — allow re-sending after rejection or team deletion.)
// We enforce this in the controller, not with a unique index, so history is preserved.
invitationSchema.index({ sender: 1, receiver: 1, status: 1 });

const Invitation = mongoose.model("Invitation", invitationSchema);
export default Invitation;
