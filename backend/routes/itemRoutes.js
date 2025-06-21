const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getItemStats,
} = require("../controllers/itemController")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads")
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Routes
router.get("/stats", getItemStats)
router.get("/search", searchItems)
router.get("/", getAllItems)
router.get("/:id", getItemById)
router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  createItem,
)
router.put(
  "/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  updateItem,
)
router.delete("/:id", deleteItem)

module.exports = router
