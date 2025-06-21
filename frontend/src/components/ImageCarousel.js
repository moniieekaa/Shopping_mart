"use client"

import { useState } from "react"

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  if (images.length === 0) {
    return <div className="carousel-placeholder">No images available</div>
  }

  return (
    <div className="carousel-container">
      <div className="carousel-main">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Image ${currentIndex + 1}`}
          className="carousel-image"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=400&width=400"
          }}
        />

        {images.length > 1 && (
          <>
            <button className="carousel-btn carousel-btn-prev" onClick={goToPrevious}>
              ‹
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={goToNext}>
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              className={`carousel-thumbnail ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=60&width=60"
                }}
              />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="carousel-indicators">
          <span>
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  )
}

export default ImageCarousel
