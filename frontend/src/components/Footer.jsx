import React from 'react';
import { Store, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={18} color="#059669" />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>FreshCart AI Supermarket</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
          <span>H2 In-Memory Dev / MySQL Prod</span>
          <span>•</span>
          <span>Spring Boot 3 + React + Vite</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={14} color="#ef4444" fill="#ef4444" />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
