import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    content: {
      type: String,
    },
    parent: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);
const fileModel = new mongoose.model("Files", fileSchema);
export default fileModel;
