import React from 'react'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <div className="nav-brand">
          Cyril
        </div>
        <div className="nav-links">
          <a href="#features" style={{ marginRight: '2rem', fontWeight: 500 }}>Features</a>
          <a href="/cyril" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Open App</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
