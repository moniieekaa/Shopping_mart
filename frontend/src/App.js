"use client"
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom"
import { useState } from "react"
import AddItem from "./components/AddItem"
import ViewItems from "./components/ViewItems"
import "./App.css"

function Navigation() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">Clothing Inventory</h1>
        <div className="nav-links">
          <Link to="/add" className={`nav-link ${location.pathname === "/add" ? "active" : ""}`}>
            Add Items
          </Link>
          <Link
            to="/view"
            className={`nav-link ${location.pathname === "/view" || location.pathname === "/" ? "active" : ""}`}
          >
            View Items
          </Link>
        </div>
      </div>
    </nav>
  )
}

function AppContent() {
  const [items, setItems] = useState([])

  const addItem = (newItem) => {
    setItems((prev) => [newItem, ...prev])
  }

  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ViewItems />} />
          <Route path="/add" element={<AddItem onAddItem={addItem} />} />
          <Route path="/view" element={<ViewItems />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
