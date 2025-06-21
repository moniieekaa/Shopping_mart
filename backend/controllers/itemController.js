const Item = require("../models/Item")
const fs = require("fs")
const path = require("path")

// Get all items with pagination and filtering
const getAllItems = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { isActive: true }

    // Add type filter if provided
    if (req.query.type && req.query.type !== "all") {
      filter.type = req.query.type
    }

    // Add search filter if provided
    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    const items = await Item.find(filter).sort({ dateAdded: -1 }).skip(skip).limit(limit)

    const total = await Item.countDocuments(filter)

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    })
  }
}

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    })
  }
}

// Create new item
const createItem = async (req, res) => {
  try {
    const itemData = req.body

    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage) {
        itemData.coverImage = `/uploads/${req.files.coverImage[0].filename}`
      }

      if (req.files.additionalImages) {
        itemData.additionalImages = req.files.additionalImages.map((file) => `/uploads/${file.filename}`)
      }
    }

    // Handle base64 images from frontend (for compatibility)
    if (itemData.coverImageBase64) {
      const coverImagePath = await saveBase64Image(itemData.coverImageBase64, "cover")
      itemData.coverImage = coverImagePath
      delete itemData.coverImageBase64
    }

    if (itemData.additionalImagesBase64) {
      const additionalImagePaths = await Promise.all(
        itemData.additionalImagesBase64.map((base64, index) => saveBase64Image(base64, `additional-${index}`)),
      )
      itemData.additionalImages = additionalImagePaths
      delete itemData.additionalImagesBase64
    }

    const item = new Item(itemData)
    await item.save()

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating item",
      error: error.message,
    })
  }
}

// Update item
const updateItem = async (req, res) => {
  try {
    const itemData = req.body

    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage) {
        itemData.coverImage = `/uploads/${req.files.coverImage[0].filename}`
      }

      if (req.files.additionalImages) {
        itemData.additionalImages = req.files.additionalImages.map((file) => `/uploads/${file.filename}`)
      }
    }

    const item = await Item.findByIdAndUpdate(req.params.id, itemData, { new: true, runValidators: true })

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    res.json({
      success: true,
      message: "Item updated successfully",
      data: item,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    })
  }
}

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    // Soft delete - just mark as inactive
    item.isActive = false
    await item.save()

    res.json({
      success: true,
      message: "Item deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    })
  }
}

// Search items
const searchItems = async (req, res) => {
  try {
    const { q, type, minPrice, maxPrice, size, condition } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { isActive: true }

    // Text search
    if (q) {
      filter.$text = { $search: q }
    }

    // Type filter
    if (type && type !== "all") {
      filter.type = type
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice)
    }

    // Size filter
    if (size && size !== "all") {
      filter.size = size
    }

    // Condition filter
    if (condition && condition !== "all") {
      filter.condition = condition
    }

    const items = await Item.find(filter)
      .sort(q ? { score: { $meta: "textScore" } } : { dateAdded: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Item.countDocuments(filter)

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching items",
      error: error.message,
    })
  }
}

// Get item statistics
const getItemStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ isActive: true })

    const typeStats = await Item.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const recentItems = await Item.find({ isActive: true })
      .sort({ dateAdded: -1 })
      .limit(5)
      .select("name type dateAdded")

    res.json({
      success: true,
      data: {
        totalItems,
        typeStats,
        recentItems,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    })
  }
}

// Helper function to save base64 images
const saveBase64Image = async (base64Data, prefix) => {
  try {
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, "")

    // Generate unique filename
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`
    const filepath = path.join(__dirname, "../uploads", filename)

    // Save file
    fs.writeFileSync(filepath, base64Image, "base64")

    return `/uploads/${filename}`
  } catch (error) {
    throw new Error("Failed to save image: " + error.message)
  }
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getItemStats,
}
