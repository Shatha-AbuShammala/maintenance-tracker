import mongoose, { Schema, Document } from "mongoose";

export type IssueStatus = "Pending" | "InProgress" | "Completed";

export interface IIssueDocument extends Document {
  title: string;
  description: string;
  type: string;
  area: string;
  image?: string;
  address?: string;
  status: IssueStatus;
  createdBy?: mongoose.Types.ObjectId | string;
}

const IssueSchema = new Schema<IIssueDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  area: { type: String, required: true },
  image: { type: String },
  address: { type: String },
  status: { type: String, enum: ["Pending","InProgress","Completed"], default: "Pending" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Issue || mongoose.model<IIssueDocument>("Issue", IssueSchema);
