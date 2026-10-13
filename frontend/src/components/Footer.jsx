import React from 'react';
import { Sprout, ShieldCheck, Heart, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="editorial-footer">
      <div className="container footer-main-grid">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <span className="footer-brand-serif">FreshCart</span>
            <span className="footer-brand-dot">.</span>
          </div>
          <p className="footer-tagline">
            Cultivating honest connections between regional organic farmers and conscious urban households. Freshness harvested daily at sunrise.
          </p>
          <div className="footer-hub-badge">
            <MapPin size={14} />
            <span>Koramangala Fulfillment Hub • Express 30m Service</span>
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Pantry Aisles</h4>
          <ul className="footer-links-list">
            <li><Link to="/#aisles-section">Fruits & Vegetables</Link></li>
            <li><Link to="/#aisles-section">Farm Dairy & Butter</Link></li>
            <li><Link to="/#aisles-section">Artisan Sourdough Bakery</Link></li>
            <li><Link to="/#aisles-section">Unpolished Grains & Pulses</Link></li>
            <li><Link to="/#aisles-section">Cold-Pressed Cooking Oils</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Customer & Trust</h4>
          <ul className="footer-links-list">
            <li><Link to="/orders">Order History & Receipts</Link></li>
            <li><Link to="/cart">Cart & Budget Audit</Link></li>
            <li><Link to="/login">Customer Account Sign In</Link></li>
            <li><Link to="/register">Create New Account</Link></li>
            <li><Link to="/admin">Administrator Portal</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Store Hours</h4>
          <div className="footer-hours-box">
            <div className="hours-row">
              <Clock size={14} />
              <span>Monday – Sunday: 6:00 AM – 10:00 PM</span>
            </div>
            <p className="hours-note">
              Sunrise orders placed before 8:00 AM are delivered in morning cold-chain slot (9:00 AM – 11:00 AM).
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom-strip">
        <div className="container footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} FreshCart Supermarket Systems. Built with Spring Boot 3 & React. All rights reserved.
          </p>
          <div className="footer-certifications">
            <span>100% Traceable Harvest</span>
            <span>•</span>
            <span>Zero Single-Use Plastic</span>
            <span>•</span>
            <span>Fair Farmgate Pricing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
