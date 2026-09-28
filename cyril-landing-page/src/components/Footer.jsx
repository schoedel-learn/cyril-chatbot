import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#FAF9F6', borderTop: '1px solid rgba(197, 160, 89, 0.2)', padding: '2rem 0', marginTop: 'auto' }}>
      <div className="container flex justify-between items-center" style={{ flexWrap: 'wrap' }}>
        <div className="nav-brand" style={{ fontSize: '1.2rem' }}>
          Cyril
        </div>
        <div style={{ fontSize: '0.9rem', color: '#4A4A4A', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <span>&copy; {new Date().getFullYear()} Schoedel Design. All rights reserved.</span>
          <Link to="/content-policy" className="text-purple" style={{ fontWeight: '500' }}>
            Content Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
