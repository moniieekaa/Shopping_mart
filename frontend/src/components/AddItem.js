"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { itemAPI } from "../services/api"

const clothingTypes = [
  "T-Shirt",
  "Jeans",
  "Dress",
  "Jacket",
  "Sweater",
  "Shorts",
  "Skirt",
  "Blouse",
  "Pants",
  "Hoodie",
  "Other",
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"]
const conditions = ["New", "Like New", "Good", "Fair", "Poor"]

function AddItem({ onAddItem }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    coverImage: null,
    additionalImages: [],
    price: "",
    size: "",
    color: "",
    brand: "",
    condition: "",
  })
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
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

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      additionalImages: files,
    }))

    // Create previews
    const previews = []
    let loadedCount = 0

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target.result)
        loadedCount++
        if (loadedCount === files.length) {
          setAdditionalImagePreviews([...previews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.type) {
      newErrors.type = "Type is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.coverImage) {
      newErrors.coverImage = "Cover image is required"
    }

    if (formData.price && isNaN(Number.parseFloat(formData.price))) {
      newErrors.price = "Price must be a valid number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
      }

      // Remove empty fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === null) {
          delete submitData[key]
        }
      })

      const response = await itemAPI.create(submitData)

      // Show success message
      setShowSuccess(true)

      // Reset form
      setFormData({
        name: "",
        type: "",
        description: "",
        coverImage: null,
        additionalImages: [],
        price: "",
        size: "",
        color: "",
        brand: "",
        condition: "",
      })
      setCoverImagePreview(null)
      setAdditionalImagePreviews([])

      // Call parent callback if provided (for local state update)
      if (onAddItem) {
        onAddItem(response.data)
      }

      // Hide success message and redirect after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        navigate("/view")
      }, 2000)
    } catch (error) {
      console.error("Error creating item:", error)
      setErrors({ submit: error.message || "Failed to create item. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="success-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Item Successfully Added!</h2>
          <p>Redirecting to view items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="add-item-container">
      <div className="form-container">
        <h2>Add New Clothing Item</h2>

        <form onSubmit={handleSubmit} className="add-item-form">
          {errors.submit && <div className="error-banner">{errors.submit}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter item name"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? "error" : ""}
                disabled={isSubmitting}
              >
                <option value="">Select clothing type</option>
                {clothingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? "error" : ""}
              placeholder="Enter item description"
              rows="4"
              disabled={isSubmitting}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? "error" : ""}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="size">Size</label>
              <select id="size" name="size" value={formData.size} onChange={handleInputChange} disabled={isSubmitting}>
                <option value="">Select size</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Enter color"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Enter brand"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">Select condition</option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image *</label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleCoverImageChange}
              className={errors.coverImage ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.coverImage && <span className="error-message">{errors.coverImage}</span>}
            {coverImagePreview && (
              <div className="image-preview">
                <img src={coverImagePreview || "/placeholder.svg"} alt="Cover preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="additionalImages">Additional Images (Optional)</label>
            <input
              type="file"
              id="additionalImages"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              disabled={isSubmitting}
            />
            {additionalImagePreviews.length > 0 && (
              <div className="additional-images-preview">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index} className="additional-image-preview">
                    <img src={preview || "/placeholder.svg"} alt={`Additional preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Adding Item..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddItem
