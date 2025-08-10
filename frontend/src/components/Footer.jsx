import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; 2024 QA/QC Compliance System. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/contact" className="footer-link">Contact Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
