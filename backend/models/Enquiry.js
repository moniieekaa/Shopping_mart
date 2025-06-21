const mongoose = require("mongoose")

const EnquirySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID is required"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    customerPhone: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "responded", "closed"],
      default: "pending",
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
EnquirySchema.index({ itemId: 1 })
EnquirySchema.index({ customerEmail: 1 })
EnquirySchema.index({ status: 1 })
EnquirySchema.index({ createdAt: -1 })

module.exports = mongoose.model("Enquiry", EnquirySchema)
