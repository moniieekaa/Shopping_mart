const express = require("express")
const { sendEnquiryEmail, getEnquiries } = require("../controllers/emailController")

const router = express.Router()

// Routes
router.post("/enquiry", sendEnquiryEmail)
router.get("/enquiries", getEnquiries)

module.exports = router
