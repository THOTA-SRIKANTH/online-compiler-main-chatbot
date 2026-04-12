import mongoose from "mongoose";

const repoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    files: [mongoose.Types.ObjectId],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    sharedBy:{
      type:[String]
    }
  },
  { timestamps: true }
);
const repoModel = mongoose.model("Repository", repoSchema);
export default repoModel;