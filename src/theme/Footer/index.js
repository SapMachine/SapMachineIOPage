// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React, { useState } from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  FlexBox,
  FlexBoxDirection,
  FlexBoxAlignItems,
  FlexBoxWrap,
  Text,
  Link as UI5Link,
  Icon,
  Title,
  Button,
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/world.js';
import '@ui5/webcomponents-icons/dist/back-to-top.js';

// Desktop footer link column component
function FooterLinkColumn({ title, items }) {
  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      style={{ minWidth: '160px', flex: 1 }}
    >
      <Title
        level="H6"
        style={{
          marginBottom: '20px',
          color: '#223548',
          fontWeight: '600',
          fontSize: '16px',
        }}
      >
        {title}
      </Title>
      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '12px' }}>
        {items.map((item, idx) => (
          <UI5Link
            key={idx}
            href={item.href || item.to}
            target={item.href?.startsWith('http') ? '_blank' : '_self'}
            style={{
              fontSize: '14px',
              color: '#354A5F',
            }}
            className="footer-link"
          >
            {item.label}
          </UI5Link>
        ))}
      </FlexBox>
    </FlexBox>
  );
}

// Mobile collapsible accordion section
function FooterAccordion({ title, items, isFirst }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`footer-accordion${isFirst ? ' footer-accordion-first' : ''}`}>
      <button
        className="footer-accordion-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <svg
          className={`footer-accordion-arrow${open ? ' footer-accordion-arrow--open' : ''}`}
          width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{title}</span>
      </button>
      <div className={`footer-accordion-body${open ? ' footer-accordion-body--open' : ''}`}>
        <div className="footer-accordion-items">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.href || item.to}
              target={item.href?.startsWith('http') ? '_blank' : '_self'}
              rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="footer-accordion-link"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <div className="footer-accordion-separator" />
    </div>
  );
}

// Social link component with styling per SAP guidelines
// Container: 32px height, 1px border, 4px corner radius
// Icon: 16x16px
// Padding: 8px horizontal & vertical
// Spacing between buttons: 12px (handled by parent gap)
// Colors - Default: white bg, white border, grey-9 icon (#223548)
// Colors - Hover: white bg, grey-4 border (#A9B4BE), blue-9 icon (#0040B0)
// Colors - Active: white bg, blue-9 border (#0040B0), grey-9 icon
function SocialLink({ href, iconSrc, alt }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Determine border color based on state
  let borderColor = '#FFFFFF'; // Default: white border
  if (isActive) {
    borderColor = '#0040B0'; // Active: Blue/9
  } else if (isHovered) {
    borderColor = '#A9B4BE'; // Hover: Grey/4
  }

  // Determine icon filter based on state
  // Default: grey-9 (#223548), Hover: blue-9 (#0040B0)
  // Using CSS filter to colorize the icons
  let iconFilter = 'none'; // Icons are already grey-9 (#1a2733, close to #223548)
  if (isHovered && !isActive) {
    // Convert to blue-9 (#0040B0) using filter
    iconFilter = 'invert(17%) sepia(100%) saturate(2000%) hue-rotate(210deg) brightness(70%) contrast(110%)';
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={alt}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        padding: '8px',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s ease',
        textDecoration: 'none',
      }}
    >
      <img
        src={iconSrc}
        alt={alt}
        style={{
          width: '16px',
          height: '16px',
          filter: iconFilter,
          transition: 'filter 0.15s ease',
        }}
      />
    </a>
  );
}

export default function Footer() {
  const { footer } = useThemeConfig();
  const logoUrl = useBaseUrl('/img/logos/sap-logo-svg.svg');
  
  // Social media icon paths
  const facebookIcon = useBaseUrl('/img/social_media_icons/icon-2024-facebook.svg');
  const youtubeIcon = useBaseUrl('/img/social_media_icons/icon-2024-youtube.svg');
  const linkedinIcon = useBaseUrl('/img/social_media_icons/icon-2024-linked-in.svg');
  const instagramIcon = useBaseUrl('/img/social_media_icons/icon-2024-instagram.svg');
  const emailIcon = useBaseUrl('/img/social_media_icons/icon-2024-envelope.svg');

  // Default footer configuration matching the Figma design
  const defaultConfig = {
    links: [
      {
        title: 'Quick Links',
        items: [
          { label: 'SAP Trust Center', href: 'https://www.sap.com/about/trust-center.html' },
          { label: 'Find a solution', href: 'https://www.sap.com/products.html' },
          { label: 'Industries', href: 'https://www.sap.com/industries.html' },
          { label: 'Find a partner', href: 'https://www.sap.com/partners.html' },
          { label: 'Trials and demos', href: 'https://www.sap.com/products/free-trials.html' },
          { label: 'Find services', href: 'https://www.sap.com/services.html' },
        ],
      },
      // {
      //   title: 'Trending',
      //   items: [
      //     { label: 'SAP Sapphire', href: 'https://www.sap.com/events/sapphire.html' },
      //     { label: 'SAP Business Suite', href: 'https://www.sap.com/products/erp.html' },
      //     { label: 'SAP Business Data Cloud', href: 'https://www.sap.com/products/technology-platform/datasphere.html' },
      //     { label: 'SAP Business AI', href: 'https://www.sap.com/products/artificial-intelligence.html' },
      //     { label: 'Sustainability', href: 'https://www.sap.com/sustainability.html' },
      //     { label: 'Partner ecosystem', href: 'https://www.sap.com/partners.html' },
      //   ],
      // },
      {
        title: 'About SAP',
        items: [
          { label: 'Company information', href: 'https://www.sap.com/about.html' },
          { label: 'Worldwide directory', href: 'https://www.sap.com/about/company/office-locations.html' },
          { label: 'Investor relations', href: 'https://www.sap.com/investors.html' },
          { label: 'Careers', href: 'https://www.sap.com/about/careers.html' },
          { label: 'News and press', href: 'https://news.sap.com/' },
          { label: 'Events', href: 'https://www.sap.com/events.html' },
          { label: 'Customer stories', href: 'https://www.sap.com/about/customer-stories.html' },
          { label: 'Newsletter', href: 'https://www.sap.com/registration/newsletter.html' },
        ],
      },
      {
        title: 'Site Information',
        items: [
          { label: 'Privacy', href: 'https://www.sap.com/about/legal/privacy.html' },
          { label: 'Terms of use', href: 'https://www.sap.com/about/legal/terms-of-use.html' },
          { label: 'Legal disclosure', href: 'https://www.sap.com/about/legal/impressum.html' },
          { label: 'Copyright', href: 'https://www.sap.com/about/legal/copyright.html' },
          { label: 'Trademark', href: 'https://www.sap.com/about/legal/trademark.html' },
          { label: 'Cookie statement', href: 'https://www.sap.com/about/legal/cookie.html' },
          { label: 'Cookie preferences', href: '#' },
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} SAP SE or an SAP affiliate company. All rights reserved.`,
  };

  const footerConfig = footer?.links?.length > 0 ? footer : defaultConfig;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        backgroundColor: '#EAECEE',
        paddingTop: '48px',
        paddingBottom: '32px',
        marginTop: 'auto',
        fontFamily: '"72", "72full", Arial, Helvetica, sans-serif',
        position: 'relative',
      }}
    >
      <div className="grid-container">
        {/* ── DESKTOP layout ── */}
        <div className="footer-desktop">
          <FlexBox direction={FlexBoxDirection.Column}>
            {/* Main row: logo+tagline left, columns right, back-to-top top-right corner */}
            <div style={{ position: 'relative', marginBottom: '40px' }}>
              <FlexBox alignItems={FlexBoxAlignItems.Start} style={{ gap: '48px' }}>
                <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ flexShrink: 0 }}>
                  <img src={logoUrl} alt="SAP" style={{ height: '32px', width: 'auto', marginRight: '8px' }} />
                  <Text style={{ fontSize: '22px', fontWeight: 'bold', color: '#002A86', letterSpacing: '-0.5px' }}>
                    Bring out your best.
                  </Text>
                </FlexBox>
                <FlexBox wrap={FlexBoxWrap.Wrap} style={{ gap: '48px', flex: 1, marginTop: '6px', marginLeft: '80px' }}>
                  {footerConfig.links.map((linkGroup, idx) => (
                    <FooterLinkColumn key={idx} title={linkGroup.title} items={linkGroup.items} />
                  ))}
                </FlexBox>
              </FlexBox>
              <Button
                design="Transparent"
                icon="back-to-top"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="footer-back-to-top"
                style={{ position: 'absolute', top: 0, right: 0 }}
              />
            </div>

            {/* Bottom section */}
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#475E75' }}>
                {footerConfig.copyright || defaultConfig.copyright}
              </Text>
              <FlexBox style={{ gap: '12px' }}>
                <SocialLink href="https://www.facebook.com/SAP" alt="Facebook" iconSrc={facebookIcon} />
                <SocialLink href="https://www.youtube.com/@SAP" alt="YouTube" iconSrc={youtubeIcon} />
                <SocialLink href="https://www.linkedin.com/company/sap" alt="LinkedIn" iconSrc={linkedinIcon} />
                <SocialLink href="https://www.instagram.com/sap/" alt="Instagram" iconSrc={instagramIcon} />
                <SocialLink href="mailto:sapmachine@sap.com" alt="Email" iconSrc={emailIcon} />
              </FlexBox>
            </FlexBox>
          </FlexBox>
        </div>

        {/* ── MOBILE layout ── */}
        <div className="footer-mobile">
          {/* SAP logo + tagline + back to top */}
          <div className="footer-mobile-logo">
            <img src={logoUrl} alt="SAP" style={{ height: '32px', width: 'auto', marginRight: '8px' }} />
            <span className="footer-mobile-tagline">Bring out your best.</span>
            <button className="footer-mobile-back-to-top" onClick={scrollToTop} aria-label="Back to top">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <line x1="5" y1="4" x2="19" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="20" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 13L12 7L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Accordion sections */}
          {footerConfig.links.map((linkGroup, idx) => (
            <FooterAccordion key={idx} title={linkGroup.title} items={linkGroup.items} isFirst={idx === 0} />
          ))}

          {/* Copyright */}
          <p className="footer-mobile-copyright">
            {footerConfig.copyright || defaultConfig.copyright}
          </p>

          {/* Social icons */}
          <div className="footer-mobile-social">
            <SocialLink href="https://www.facebook.com/SAP" alt="Facebook" iconSrc={facebookIcon} />
            <SocialLink href="https://www.youtube.com/@SAP" alt="YouTube" iconSrc={youtubeIcon} />
            <SocialLink href="https://www.linkedin.com/company/sap" alt="LinkedIn" iconSrc={linkedinIcon} />
            <SocialLink href="https://www.instagram.com/sap/" alt="Instagram" iconSrc={instagramIcon} />
            <SocialLink href="mailto:sapmachine@sap.com" alt="Email" iconSrc={emailIcon} />
          </div>
        </div>
      </div>
    </footer>
  );
}