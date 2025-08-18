import mongoose, { Schema } from "mongoose";

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
    expireAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index for auto expiration
apiKeySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const ApiKey = new mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;
