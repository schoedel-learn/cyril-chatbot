import React from 'react'

const Features = () => {
  const features = [
    {
      title: 'Role-Based AI Personas',
      desc: 'Cyril automatically tailors its tone and depth whether speaking to a Candidate, Sponsor, Catechist, Priest, Deacon, or OCIA Leader.',
      icon: '🎭'
    },
    {
      title: 'Deep Thinking & Search',
      desc: 'Toggle Deep Think mode for complex canonical reasoning, backed by live Google Web Search for up-to-date, cited answers.',
      icon: '🧠'
    },
    {
      title: 'Multimodal Capabilities',
      desc: 'Speak naturally using voice-to-text, listen to Cyril via text-to-speech, or upload images (like liturgical items) for deep theological analysis.',
      icon: '🗣️'
    },
    {
      title: 'Custom Parish Knowledge',
      desc: 'Administrators can upload specific parish schedules, diocesan norms, and custom guides. Cyril will dynamically reference these to provide localized help.',
      icon: '📖'
    },
    {
      title: 'Personalized Memory',
      desc: 'Tell Cyril to remember specific details about your spiritual journey or pastoral concerns, and it will incorporate that context into all future conversations.',
      icon: '💭'
    },
    {
      title: 'Chat History & Export',
      desc: 'All conversations are securely saved to your profile. You can review past chats or export them as a text file to share with your sponsor or director.',
      icon: '💬'
    }
  ]

  return (
    <section id="features" className="py-20" style={{ backgroundColor: 'white' }}>
      <div className="container">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '2.5rem' }}>Equipping the <span className="text-gold">Catechist</span></h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '1rem auto' }}>
            Built specifically for the rigors and beauty of the Order of Christian Initiation of Adults.
          </p>
        </div>
        
        <div className="grid grid-cols-3 md-grid-cols-1 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">
                {feat.icon}
              </div>
              <h3 className="mb-4" style={{ fontSize: '1.25rem' }}>{feat.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
