import React from 'react';
import { Store, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={18} color="var(--brand-forest)" />
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>FreshCart Supermarket Management</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.84rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>Koramangala Fulfillment Hub</span>
          <span>•</span>
          <span>Spring Boot 3 + React + Vite</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Direct Mandi Staples
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
