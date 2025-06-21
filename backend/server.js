const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const itemRoutes = require("./routes/itemRoutes")
const emailRoutes = require("./routes/emailRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/clothing-inventory"
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ MongoDB Connected Successfully")
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message)
    process.exit(1)
  }
}

// Connect to MongoDB
connectDB()

// Routes
app.use("/api/items", itemRoutes)
app.use("/api/email", emailRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Clothing Inventory API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`)
})

module.exports = app
