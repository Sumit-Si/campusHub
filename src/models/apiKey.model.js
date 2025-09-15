import mongoose, { Schema } from "mongoose";
import { ApiKeyStatusEnum, AvailableApiKeyStatus } from "../constants.js";

const apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: AvailableApiKeyStatus,
      default: ApiKeyStatusEnum.ACTIVE,
    }
  },
  {
    timestamps: true,
  },
);

const ApiKey = new mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;
