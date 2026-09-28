import React from 'react'

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="grid grid-cols-2 md-grid-cols-1 items-center gap-8">
          <div className="hero-content">
            <h1 className="hero-title">
              Cyril
            </h1>
            <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
              The AI Assistant for OCIA Formation
            </h2>
            <p className="hero-subtitle mb-8">
              Empower your parish with an intelligent, deeply pastoral tool designed exclusively to support the Order of Christian Initiation of Adults. Cyril provides catechists, candidates, and leaders with a fully bilingual, multimodal AI experience featuring personalized memory and authoritative theological insights.
            </p>
            <div className="flex gap-4 md-flex-col">
              <a href="/cyril" className="btn btn-gold">Open Cyril</a>
              <a href="#features" className="btn btn-outline">Learn More</a>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="hero-image-wrapper">
              <img src="/hero.png" alt="Stained glass dove over an open book" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
