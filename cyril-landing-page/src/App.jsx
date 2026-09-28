import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import BilingualFeature from './components/BilingualFeature'
import CallToAction from './components/CallToAction'
import ContentPolicy from './components/ContentPolicy'
import Footer from './components/Footer'

function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <BilingualFeature />
      <CallToAction />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/content-policy" element={<ContentPolicy />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
