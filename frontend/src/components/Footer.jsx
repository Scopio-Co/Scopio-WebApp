import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h2 className="footer-logo">SCOPIO</h2>
            <p className="footer-description">
              Empowering learners worldwide with cutting-edge online education. Join millions of 
              students in their journey to success.
            </p>
            
            {/* Social Media Icons */}
            <div className="social-media footer-social-media">
                <button
                type="button"
                className="social-button Instagram"
                onClick={() => handleSocialLogin('Instagram')}
              >
                <img src="../../../src/assets/img/Instagram.svg" alt="Instagram" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button linkedin"
                onClick={() => handleSocialLogin('LinkedIn')}
              >
                <img src="../../../src/assets/img/Linkedin.svg" alt="LinkedIn" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button discord"
                onClick={() => handleSocialLogin('Discord')}
              >
                <img src="../../../src/assets/img/Discord.svg" alt="Discord" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button whatsapp"
                onClick={() => handleSocialLogin('WhatsApp')}
              >
                <img src="../../../src/assets/img/WhatsApp.svg" alt="WhatsApp" className="social-icon" />
              </button>
              <button
                type="button"
                className="social-button x"
                onClick={() => handleSocialLogin('x')}
              >
                <img src="../../../src/assets/img/x.svg" alt="x" className='social-icon'/>
              </button>
              </div>
            </div>
          <div className="footer-section-combined">
          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#tutors">Tutors</a></li>
              <li><a href="#plans">Plans</a></li>
              <li><a href="#settings">Settings</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#features">Feature requests</a></li>
              <li><a href="#bugs">Bug Reports</a></li>
              <li><a href="#settings">Settings</a></li>
            </ul>
          </div>
          </div>
          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-heading">Contact</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon email">
                  <img src="../../../src/assets/img/Mail.svg" alt="Email" className='social-icon'/>
                </div>
                <span>scopio@gmail.com</span>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon phone">
                    <img src="../../../src/assets/img/Phone.svg" alt="Phone" className='social-icon'/>
                </div>
                <span>+91 25525 26253</span>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon location">
                  <img src="../../../src/assets/img/Location.svg" alt="Location" className='social-icon'/>
                </div>
                <span>24/103, Apprt street, Nagercoil</span>
              </div>
            </div>
          </div>
        </div>
        
            <div className="border-line"></div>
        {/* Powered By Section */}
        <div className="powered-by-section">
          <h4 className="powered-by-title">Powered By</h4>
          <div className="tech-logos-container">
            <div className="tech-logos-track">
              <div className="tech-logo">
                <img src="../../../src/assets/img/FreeCodeCamp_logo 1.png" alt="FreeCodeCamp" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/brototype.png" alt="Brototype" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/arduino.svg" alt="Arduino" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/Linkedin (1).svg" alt="LinkedIn" /> 
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/FreeCodeCamp_logo 1.png" alt="FreeCodeCamp" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/brototype.png" alt="Brototype" />
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className="tech-logo">
                <img src="../../../src/assets/img/FreeCodeCamp_logo 1.png" alt="FreeCodeCamp" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/brototype.png" alt="Brototype" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/arduino.svg" alt="Arduino" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/Linkedin (1).svg" alt="LinkedIn" /> 
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/FreeCodeCamp_logo 1.png" alt="FreeCodeCamp" />
              </div>
              <div className="tech-logo">
                <img src="../../../src/assets/img/brototype.png" alt="Brototype" />
              </div>
            </div>
            <div className="fade-left"></div>
            <div className="fade-right"></div>
          </div>
        </div>
        <div className="border-line"></div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <span>©2025 SCOPIO. All rights reserved.</span>
          </div>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;