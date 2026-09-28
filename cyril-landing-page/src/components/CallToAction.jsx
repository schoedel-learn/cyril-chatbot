import React from 'react'

const CallToAction = () => {
  return (
    <footer className="call-to-action">
      <div className="container">
        <h2 className="mb-4" style={{ fontSize: '2.5rem' }}>Ready to enhance your OCIA program?</h2>
        <p className="mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Start using Cyril today. Our AI assistant is ready to support you with comprehensive theological knowledge and pastoral guidance.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/cyril" className="btn btn-gold">Access Cyril Now</a>
        </div>
        <p className="mt-12" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Catholic.Work. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default CallToAction
