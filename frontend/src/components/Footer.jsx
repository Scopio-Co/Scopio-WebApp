import React, { useEffect, useRef } from 'react';
import './Footer.css';
import instagramIcon from '../assets/img/instagram.svg';
import linkedinIcon from '../assets/img/Linkedin.svg';
import discordIcon from '../assets/img/Discord.svg';
import whatsappIcon from '../assets/img/Whatsapp.svg';
import xIcon from '../assets/img/x.svg';
import mailIcon from '../assets/img/Mail.svg';
import phoneIcon from '../assets/img/Phone.svg';
import locationIcon from '../assets/img/Location.svg';
import smiifIcon from '../assets/img/smiif.png';
import smceIcon from '../assets/img/smce.png';
import agIcon from '../assets/img/ag.png';
import startupIcon from '../assets/img/startuptn.png';
import freecodecampIcon from '../assets/img/FreeCodeCamp_logo 1.png';

const Footer = () => {
  const handleSocialLogin = (platform) => {
    console.log(`Opening ${platform}`);
  };

  // Logos used in the powered-by track. We render two identical sequences
  // and measure the sequence width to animate by exactly one sequence width.
  const techLogos = [
    { src: smiifIcon, alt: 'Smiif Icon'},
    { src: smceIcon, alt: 'Smce Icon', className: 'smce-logo' },
    { src: agIcon, alt: 'AgileTribe Icon' , className: 'smce-logo' },
    { src: startupIcon, alt: 'StartupTN Icon' },
    { src: freecodecampIcon, alt: 'Freecodecamp Icon' },
  ];

  const trackRef = useRef(null);
  const seqRef = useRef(null);

  useEffect(() => {
    if (!seqRef.current || !trackRef.current) return;

    const setSeqWidth = () => {
      const seqWidth = seqRef.current.getBoundingClientRect().width;
      // set CSS variable on track for use in keyframes
      trackRef.current.style.setProperty('--seq-width', `${seqWidth}px`);
    };

    setSeqWidth();
    let resizeId = null;
    const onResize = () => {
      if (resizeId) cancelAnimationFrame(resizeId);
      resizeId = requestAnimationFrame(setSeqWidth);
    };

    // Recalculate when images load (helps on slow networks/devices)
    const imgs = seqRef.current.querySelectorAll('img');
    const onImgLoad = () => setSeqWidth();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImgLoad);
    });

    window.addEventListener('resize', onResize);
    // also recalc after a short delay to catch layout changes
    const timeoutId = setTimeout(setSeqWidth, 250);

    return () => {
      window.removeEventListener('resize', onResize);
      imgs.forEach((img) => {
        img.removeEventListener('load', onImgLoad);
      });
      if (resizeId) cancelAnimationFrame(resizeId);
      clearTimeout(timeoutId);
    };
  }, [techLogos]);

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
                onClick={() => window.open('https://www.instagram.com/scopiotech?igsh=OHpzeDJ2enA0cTI2', '_blank', 'noopener,noreferrer')}
              >
                <img src={instagramIcon} alt="Instagram" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button linkedin"
                onClick={() => window.open('https://www.linkedin.com/in/scopio-learn-2672b7374?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', '_blank', 'noopener,noreferrer')}
              >
                <img src={linkedinIcon} alt="LinkedIn" className='social-icon'/>
              </button>
              <button
                type="button"
                className="social-button whatsapp"
                onClick={() => window.open('https://chat.whatsapp.com/CT8BRmbJq8fC2AFjWzT6k0', '_blank', 'noopener,noreferrer')}
              >
                <img src={whatsappIcon} alt="WhatsApp" className="social-icon" />
              </button>
              <button
                type="button"
                className="social-button discord"
                onClick={() => handleSocialLogin('Discord')}
              >
                <img src={discordIcon} alt="Discord" className='social-icon'/>
              </button>
              
              <button
                type="button"
                className="social-button x"
                onClick={() => handleSocialLogin('x')}
              >
                <img src={xIcon} alt="x" className='social-icon'/>
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
                  <img src={mailIcon} alt="Email" className='social-icon'/>
                </div>
                <span>scopioedutech@gmail.com</span>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon phone">
                  <img src={phoneIcon} alt="Phone" className='social-icon'/>
                </div>
                <span>+91 94883 38010</span>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon location">
                  <img src={locationIcon} alt="Location" className='social-icon'/>
                </div>
                <span>Stella Mary's Innovation and Incubation Foundation, Ganapathipuram, Nagercoil, Tamil Nadu 629202</span>
              </div>
            </div>
          </div>
        </div>
        
            <div className="border-line"></div>
        {/* Powered By Section */}
        <div className="powered-by-section">
          <h4 className="powered-by-title">Powered By</h4>
          <div className="tech-logos-container">
            <div className="tech-logos-track animate" ref={trackRef} aria-hidden="true">
              <div className="tech-logos-sequence" ref={seqRef}>
                {techLogos.map((logo, idx) => (
                  <div className="tech-logo" key={`tech-a-${idx}`}>
                    <img src={logo.src} alt={logo.alt} className={logo.className || ''} />
                  </div>
                ))}
              </div>

              <div className="tech-logos-sequence">
                {techLogos.map((logo, idx) => (
                  <div className="tech-logo" key={`tech-b-${idx}`}>
                    <img src={logo.src} alt={logo.alt} className={logo.className || ''} />
                  </div>
                ))}
              </div>

              <div className="tech-logos-sequence">
                {techLogos.map((logo, idx) => (
                  <div className="tech-logo" key={`tech-c-${idx}`}>
                    <img src={logo.src} alt={logo.alt} className={logo.className || ''} />
                  </div>
                ))}
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
            <span>SCOPIO {new Date().getFullYear()} (Version 1.0)</span>
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