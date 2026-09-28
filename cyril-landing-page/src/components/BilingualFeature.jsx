import React from 'react'

const BilingualFeature = () => {
  return (
    <section className="bilingual-section">
      <div className="container">
        <div className="glass-panel text-center">
          <h2 className="mb-4" style={{ fontSize: '2.5rem' }}>
            Faith Without <span className="gradient-text">Language Barriers</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto 2rem auto', fontSize: '1.1rem' }}>
            The Gospel is for everyone. Cyril is fully equipped to guide inquirers, candidates, and catechists in their preferred language. Whether it's English, Spanish, or a mix of both, Cyril adapts instantly to make everyone feel welcomed.
          </p>
          
          <div className="flex justify-center mb-8 flex-wrap">
            <span className="lang-badge">English</span>
            <span className="lang-badge">Español (Latinoamérica)</span>
            <span className="lang-badge">Spanglish</span>
          </div>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-8 text-left mt-8">
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--color-accent-purple)' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                "Cyril, I am nervous about my first confession. What should I say?"
              </p>
              <p style={{ fontWeight: 500, color: 'var(--color-accent-purple)' }}>
                "It is completely normal to feel nervous. Remember that God's mercy is infinite. Here is how you can prepare..."
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--color-accent-gold)' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                "Cyril, estoy nervioso por mi primera confesión. ¿Qué debo decir?"
              </p>
              <p style={{ fontWeight: 500, color: 'var(--color-accent-purple)' }}>
                "Es completamente normal sentirse nervioso. Recuerda que la misericordia de Dios es infinita. Aquí tienes cómo puedes prepararte..."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BilingualFeature
