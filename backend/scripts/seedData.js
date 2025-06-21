const mongoose = require("mongoose")
const Item = require("../models/Item")
require("dotenv").config()

const sampleItems = [
  {
    name: "Classic Blue Jeans",
    type: "Jeans",
    description: "High-quality denim jeans with a classic fit. Perfect for casual wear and everyday comfort.",
    coverImage: "/uploads/sample-jeans.jpg",
    additionalImages: ["/uploads/sample-jeans-2.jpg", "/uploads/sample-jeans-3.jpg"],
    price: 79.99,
    size: "M",
    color: "Blue",
    brand: "DenimCo",
    condition: "New",
  },
  {
    name: "Summer Floral Dress",
    type: "Dress",
    description: "Beautiful floral print dress perfect for summer occasions. Lightweight and comfortable fabric.",
    coverImage: "/uploads/sample-dress.jpg",
    additionalImages: ["/uploads/sample-dress-2.jpg"],
    price: 89.99,
    size: "S",
    color: "Floral",
    brand: "SummerStyle",
    condition: "New",
  },
  {
    name: "Cozy Winter Sweater",
    type: "Sweater",
    description: "Warm and comfortable sweater made from premium wool blend. Perfect for cold weather.",
    coverImage: "/uploads/sample-sweater.jpg",
    additionalImages: [],
    price: 65.99,
    size: "L",
    color: "Gray",
    brand: "WarmWear",
    condition: "Like New",
  },
  {
    name: "Professional Blazer",
    type: "Jacket",
    description: "Elegant blazer suitable for business meetings and formal occasions. Tailored fit.",
    coverImage: "/uploads/sample-blazer.jpg",
    additionalImages: ["/uploads/sample-blazer-2.jpg", "/uploads/sample-blazer-3.jpg"],
    price: 129.99,
    size: "M",
    color: "Black",
    brand: "BusinessWear",
    condition: "New",
  },
  {
    name: "Casual Cotton T-Shirt",
    type: "T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear. Soft fabric and relaxed fit.",
    coverImage: "/uploads/sample-tshirt.jpg",
    additionalImages: [],
    price: 24.99,
    size: "L",
    color: "White",
    brand: "ComfortTee",
    condition: "Good",
  },
]

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/clothing-inventory"
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")

    // Clear existing items
    await Item.deleteMany({})
    console.log("🗑️  Cleared existing items")

    // Insert sample items
    const insertedItems = await Item.insertMany(sampleItems)
    console.log(`✅ Inserted ${insertedItems.length} sample items`)

    console.log("\n📋 Sample Items Created:")
    insertedItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}) - $${item.price}`)
    })

    console.log("\n🎉 Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
