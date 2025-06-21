const nodemailer = require("nodemailer")
const Enquiry = require("../models/Enquiry")
const Item = require("../models/Item")

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Send enquiry email
const sendEnquiryEmail = async (req, res) => {
  try {
    const { itemId, customerName, customerEmail, customerPhone, message } = req.body

    // Validate required fields
    if (!itemId || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Item ID, customer name, and email are required",
      })
    }

    // Get item details
    const item = await Item.findById(itemId)
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    // Create enquiry record
    const enquiry = new Enquiry({
      itemId,
      customerName,
      customerEmail,
      customerPhone,
      message,
    })

    await enquiry.save()

    // Send email if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createTransporter()

        // Email to store owner
        const ownerEmailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.STORE_EMAIL || process.env.EMAIL_USER,
          subject: `New Enquiry for ${item.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">New Item Enquiry</h2>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3498db; margin-top: 0;">Item Details</h3>
                <p><strong>Name:</strong> ${item.name}</p>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Description:</strong> ${item.description}</p>
              </div>

              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #27ae60; margin-top: 0;">Customer Information</h3>
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ""}
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
              </div>

              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Enquiry ID:</strong> ${enquiry._id}</p>
                <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Please respond to this enquiry promptly to maintain good customer service.
              </p>
            </div>
          `,
        }

        // Email to customer (confirmation)
        const customerEmailOptions = {
          from: process.env.EMAIL_USER,
          to: customerEmail,
          subject: `Thank you for your enquiry about ${item.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Thank You for Your Enquiry!</h2>
              
              <p>Dear ${customerName},</p>
              
              <p>Thank you for your interest in our clothing item. We have received your enquiry and will get back to you shortly.</p>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3498db; margin-top: 0;">Item You Enquired About</h3>
                <p><strong>Name:</strong> ${item.name}</p>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Description:</strong> ${item.description}</p>
              </div>

              ${
                message
                  ? `
                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #27ae60; margin-top: 0;">Your Message</h3>
                  <p>${message}</p>
                </div>
              `
                  : ""
              }

              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Enquiry Reference:</strong> ${enquiry._id}</p>
                <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <p>We typically respond to enquiries within 24 hours. If you have any urgent questions, please don't hesitate to contact us.</p>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                Clothing Inventory Team
              </p>
            </div>
          `,
        }

        // Send both emails
        await Promise.all([transporter.sendMail(ownerEmailOptions), transporter.sendMail(customerEmailOptions)])

        // Update enquiry status
        enquiry.emailSent = true
        enquiry.emailSentAt = new Date()
        await enquiry.save()

        res.json({
          success: true,
          message: "Enquiry submitted and emails sent successfully",
          data: {
            enquiryId: enquiry._id,
            emailSent: true,
          },
        })
      } catch (emailError) {
        console.error("Email sending failed:", emailError)

        // Still return success since enquiry was saved
        res.json({
          success: true,
          message: "Enquiry submitted successfully (email notification failed)",
          data: {
            enquiryId: enquiry._id,
            emailSent: false,
            emailError: emailError.message,
          },
        })
      }
    } else {
      // No email configuration - just save enquiry
      res.json({
        success: true,
        message: "Enquiry submitted successfully",
        data: {
          enquiryId: enquiry._id,
          emailSent: false,
          note: "Email notifications not configured",
        },
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing enquiry",
      error: error.message,
    })
  }
}

// Get all enquiries (for admin)
const getEnquiries = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }

    const enquiries = await Enquiry.find(filter)
      .populate("itemId", "name type coverImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Enquiry.countDocuments(filter)

    res.json({
      success: true,
      data: enquiries,
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
      message: "Error fetching enquiries",
      error: error.message,
    })
  }
}

module.exports = {
  sendEnquiryEmail,
  getEnquiries,
}
