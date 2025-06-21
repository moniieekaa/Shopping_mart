const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// API utility functions
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "API request failed")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Item API functions
export const itemAPI = {
  // Get all items
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/items${queryString ? `?${queryString}` : ""}`)
  },

  // Get single item
  getById: (id) => apiRequest(`/items/${id}`),

  // Create new item
  create: (itemData) => {
    // Convert to FormData for file upload
    const formData = new FormData()

    Object.keys(itemData).forEach((key) => {
      if (key === "additionalImages" && Array.isArray(itemData[key])) {
        itemData[key].forEach((file, index) => {
          formData.append("additionalImages", file)
        })
      } else if (key === "coverImage" && itemData[key]) {
        formData.append("coverImage", itemData[key])
      } else if (itemData[key] !== null && itemData[key] !== undefined) {
        formData.append(key, itemData[key])
      }
    })

    return apiRequest("/items", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  },

  // Update item
  update: (id, itemData) => {
    const formData = new FormData()

    Object.keys(itemData).forEach((key) => {
      if (key === "additionalImages" && Array.isArray(itemData[key])) {
        itemData[key].forEach((file, index) => {
          formData.append("additionalImages", file)
        })
      } else if (key === "coverImage" && itemData[key]) {
        formData.append("coverImage", itemData[key])
      } else if (itemData[key] !== null && itemData[key] !== undefined) {
        formData.append(key, itemData[key])
      }
    })

    return apiRequest(`/items/${id}`, {
      method: "PUT",
      headers: {},
      body: formData,
    })
  },

  // Delete item
  delete: (id) => apiRequest(`/items/${id}`, { method: "DELETE" }),

  // Search items
  search: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/items/search?${queryString}`)
  },

  // Get statistics
  getStats: () => apiRequest("/items/stats"),
}

// Email API functions
export const emailAPI = {
  // Send enquiry
  sendEnquiry: (enquiryData) =>
    apiRequest("/email/enquiry", {
      method: "POST",
      body: JSON.stringify(enquiryData),
    }),

  // Get enquiries (admin)
  getEnquiries: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/email/enquiries${queryString ? `?${queryString}` : ""}`)
  },
}

// Health check
export const healthCheck = () => apiRequest("/health")
