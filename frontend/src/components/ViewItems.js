"use client"

import { useState, useEffect } from "react"
import { itemAPI } from "../services/api"
import ItemDetails from "./ItemDetails"

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

function ViewItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  useEffect(() => {
    fetchItems()
  }, [pagination.currentPage, filterType])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...(filterType !== "all" && { type: filterType }),
        ...(searchTerm && { search: searchTerm }),
      }

      const response = await itemAPI.getAll(params)
      setItems(response.data)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch items")
      console.error("Error fetching items:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    fetchItems()
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedItem(null)
  }

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }))
  }

  const handleDeleteItem = (deletedId) => {
    setItems((prev) => prev.filter((item) => item._id !== deletedId))
    setShowModal(false)
    setSelectedItem(null)
    // Optionally, refresh the list from server:
    // fetchItems()
  }

  if (loading && items.length === 0) {
    return (
      <div className="view-items-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="view-items-container">
        <div className="error-state">
          <h2>Error Loading Items</h2>
          <p>{error}</p>
          <button onClick={fetchItems} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="view-items-container">
        <div className="empty-state">
          <h2>No Items Found</h2>
          <p>
            {searchTerm || filterType !== "all"
              ? "No items match your search criteria."
              : "Start by adding some clothing items to your inventory."}
          </p>
          <a href="/add" className="add-first-item-btn">
            Add Your First Item
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="view-items-container">
      <div className="items-header">
        <h2>Clothing Inventory ({pagination.totalItems} items)</h2>

        {/* Search and Filter Controls */}
        <div className="controls-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            {clothingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="items-grid">
        {items.map((item) => (
          <div key={item._id} className="item-card" style={{ position: 'relative' }}>
            {/* Delete Icon Button */}
            <button
              className="delete-icon-btn"
              onClick={async (e) => {
                e.stopPropagation();
                if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
                try {
                  await itemAPI.delete(item._id);
                  handleDeleteItem(item._id);
                } catch (err) {
                  alert(err.message || "Failed to delete item.");
                }
              }}
              title="Delete Item"
              aria-label="Delete Item"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.85,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  stroke: '#e53e3e',
                  background: 'rgba(229,62,62,0.08)',
                  borderRadius: '50%',
                  padding: 2,
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
            </button>
            {/* Card Content */}
            <div onClick={() => handleItemClick(item)} style={{ cursor: 'pointer' }}>
              <div className="item-image">
                <img
                  src={
                    item.coverImage?.startsWith("http")
                      ? item.coverImage
                      : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${item.coverImage}`
                  }
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=200&width=280"
                  }}
                />
                <div className="item-overlay">
                  <span>View Details</span>
                </div>
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <span className="item-type">{item.type}</span>
                {item.price && <span className="item-price">${item.price.toFixed(2)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedItem && (
        <ItemDetails item={selectedItem} onClose={closeModal} onDelete={handleDeleteItem} />
      )}
    </div>
  )
}

export default ViewItems
