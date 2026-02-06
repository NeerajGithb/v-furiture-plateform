import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  orderId?: Schema.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: {
    url: string;
    publicId: string;
    alt?: string;
  }[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  reportedCount: number;
  status: "pending" | "approved" | "rejected";
  moderatorNote?: string;
  sellerResponse?: {
    message: string;
    respondedAt: Date;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
          validate: {
            validator: function (v: string) {
              return /^https?:\/\/.+/.test(v);
            },
            message: "Invalid image URL",
          },
        },
        publicId: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          trim: true,
          maxlength: 100,
        },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    moderatorNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sellerResponse: {
      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },
      respondedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
);

ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ isVerifiedPurchase: 1 });
ReviewSchema.index({ helpfulVotes: -1 });
ReviewSchema.index({ unhelpfulVotes: 1 });
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
