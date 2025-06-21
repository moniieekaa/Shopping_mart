const mongoose = require("mongoose")

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Item type is required"],
      enum: ["T-Shirt", "Jeans", "Dress", "Jacket", "Sweater", "Shorts", "Skirt", "Blouse", "Pants", "Hoodie", "Other"],
    },
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    additionalImages: [
      {
        type: String,
      },
    ],
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size", ""],
    },
    color: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Poor", ""],
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
ItemSchema.index({ name: "text", description: "text", type: "text" })
ItemSchema.index({ type: 1 })
ItemSchema.index({ dateAdded: -1 })

// Virtual for total images count
ItemSchema.virtual("totalImages").get(function () {
  return 1 + this.additionalImages.length
})

// Ensure virtual fields are serialized
ItemSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Item", ItemSchema)
