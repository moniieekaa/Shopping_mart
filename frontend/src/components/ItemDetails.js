"use client"

import { useState } from "react"
import { emailAPI, itemAPI } from "../services/api"
import ImageCarousel from "./ImageCarousel"

function ItemDetails({ item, onClose, onDelete }) {
  const [showEnquireForm, setShowEnquireForm] = useState(false)
  const [showEnquireSuccess, setShowEnquireSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enquiryData, setEnquiryData] = useState({
    customerName: "",
    customerEmail: "", 
    customerPhone: "",
    message: "",
  })
  const [errors, setErrors] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target
    setEnquiryData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateEnquiryForm = () => {
    const newErrors = {}

    if (!enquiryData.customerName.trim()) {
      newErrors.customerName = "Name is required"
    }

    if (!enquiryData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(enquiryData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()

    if (!validateEnquiryForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await emailAPI.sendEnquiry({
        itemId: item._id,
        ...enquiryData,
      })

      setShowEnquireSuccess(true)
      setShowEnquireForm(false)

      // Reset form
      setEnquiryData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        message: "",
      })

      setTimeout(() => {
        setShowEnquireSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Error sending enquiry:", error)
      setErrors({ submit: error.message || "Failed to send enquiry. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return
    setIsDeleting(true)
    setDeleteError("")
    try {
      await itemAPI.delete(item._id)
      if (onDelete) onDelete(item._id)
      onClose()
    } catch (err) {
      setDeleteError(err.message || "Failed to delete item.")
    } finally {
      setIsDeleting(false)
    }
  }

  const allImages = [item.coverImage, ...(item.additionalImages || [])]
    .filter(Boolean)
    .map((img) => (img.startsWith("http") ? img : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${img}`))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-body">
          <div className="modal-images">
            <ImageCarousel images={allImages} />
          </div>

          <div className="modal-details">
            <div className="item-header">
              <h2>{item.name}</h2>
              <div className="item-badges">
                <span className="item-type-badge">{item.type}</span>
                {item.condition && <span className="item-condition-badge">{item.condition}</span>}
              </div>
            </div>

            {item.price && (
              <div className="item-price-section">
                <span className="item-price-large">${item.price.toFixed(2)}</span>
              </div>
            )}

            <div className="item-description">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="item-meta">
              <div className="meta-row">
                <strong>Date Added:</strong> {new Date(item.dateAdded || item.createdAt).toLocaleDateString()}
              </div>
              {item.size && (
                <div className="meta-row">
                  <strong>Size:</strong> {item.size}
                </div>
              )}
              {item.color && (
                <div className="meta-row">
                  <strong>Color:</strong> {item.color}
                </div>
              )}
              {item.brand && (
                <div className="meta-row">
                  <strong>Brand:</strong> {item.brand}
                </div>
              )}
              <div className="meta-row">
                <strong>Total Images:</strong> {allImages.length}
              </div>
            </div>

            <div className="modal-actions">
              {showEnquireSuccess ? (
                <div className="enquire-success">
                  <span>✓ Enquiry sent successfully! We'll get back to you soon.</span>
                </div>
              ) : showEnquireForm ? (
                <div className="enquire-form">
                  <h3>Send Enquiry</h3>
                  <form onSubmit={handleEnquirySubmit}>
                    {errors.submit && <div className="error-banner">{errors.submit}</div>}

                    <div className="form-group">
                      <label htmlFor="customerName">Your Name *</label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={enquiryData.customerName}
                        onChange={handleEnquiryChange}
                        className={errors.customerName ? "error" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.customerName && <span className="error-message">{errors.customerName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="customerEmail">Your Email *</label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={enquiryData.customerEmail}
                        onChange={handleEnquiryChange}
                        className={errors.customerEmail ? "error" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.customerEmail && <span className="error-message">{errors.customerEmail}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="customerPhone">Your Phone (Optional)</label>
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={enquiryData.customerPhone}
                        onChange={handleEnquiryChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message (Optional)</label>
                      <textarea
                        id="message"
                        name="message"
                        value={enquiryData.message}
                        onChange={handleEnquiryChange}
                        rows="3"
                        placeholder="Any specific questions about this item?"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => setShowEnquireForm(false)}
                        className="cancel-btn"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Enquiry"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button className="enquire-btn" onClick={() => setShowEnquireForm(true)}>
                  Enquire About This Item
                </button>
              )}
              {/* Delete Item Icon Button */}
              <button
                className="delete-icon-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete Item"
                aria-label="Delete Item"
                style={{
                  marginTop: 16,
                  background: 'none',
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transition: '0.2s',
                    stroke: '#e53e3e',
                    background: 'rgba(229,62,62,0.08)',
                    borderRadius: '50%',
                    padding: 4,
                    boxShadow: '0 2px 8px rgba(229,62,62,0.08)',
                  }}
                >
                  <title>Delete Item</title>
                  <path d="M3 6h18" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#e53e3e" strokeWidth="2"/>
                  <rect x="5" y="6" width="14" height="14" rx="2" stroke="#e53e3e" strokeWidth="2"/>
                  <path d="M10 11v4" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 11v4" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{
                  marginLeft: 8,
                  color: '#e53e3e',
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: 0.2,
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}>{isDeleting ? 'Deleting...' : 'Delete Item'}</span>
              </button>
              {deleteError && <div className="error-banner">{deleteError}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetails
