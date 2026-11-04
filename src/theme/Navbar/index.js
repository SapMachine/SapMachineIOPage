// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { useLocation, useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  FlexBox,
  FlexBoxAlignItems,
  FlexBoxJustifyContent,
  Icon,
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/search.js';
import '@ui5/webcomponents-icons/dist/customer.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-up.js';
import '@ui5/webcomponents-icons/dist/text-align-left.js';
import '@ui5/webcomponents-icons/dist/begin.js';
import '@ui5/webcomponents-icons/dist/business-objects-mobile.js';
import '@ui5/webcomponents-icons/dist/detail-more.js';
import { usingSection, featuresSection, generalSection } from '../../docsNavConfig.js';

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="6" width="18" height="2" rx="1" fill="var(--sap-blue7, #0070F2)" />
    <rect x="3" y="11" width="18" height="2" rx="1" fill="var(--sap-blue7, #0070F2)" />
    <rect x="3" y="16" width="18" height="2" rx="1" fill="var(--sap-blue7, #0070F2)" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <line x1="5" y1="5" x2="19" y2="19" stroke="var(--sap-blue7, #0070F2)" strokeWidth="2" strokeLinecap="round" />
    <line x1="19" y1="5" x2="5" y2="19" stroke="var(--sap-blue7, #0070F2)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Custom Dropdown Menu Component matching SAP design with accessibility
const DropdownMenu = ({
  isOpen,
  onClose,
  groups,
  style,
  menuId,
  parentRef,
  onEscape,
  currentPath
}) => {
  const dropdownRef = useRef(null);
  const menuItemsRef = useRef([]);
  const history = useHistory();

  // Determine which single item best matches the current page.
  // Uses the most specific (longest) matching path so a parent like
  // "/articles" doesn't also light up on "/articles/getting-started".
  const normalizePath = (p) => (p || '').replace(/\/+$/, '');
  const matchLength = (item) => {
    if (item.external || !item.to) return -1;
    const cur = normalizePath(currentPath);
    const target = normalizePath(item.to);
    return cur === target || cur.startsWith(target + '/') ? target.length : -1;
  };
  const flatItems = groups.flatMap((group) => group.items);
  let activeIndex = -1;
  let bestMatch = -1;
  flatItems.forEach((item, i) => {
    const len = matchLength(item);
    if (len > bestMatch) {
      bestMatch = len;
      activeIndex = i;
    }
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on the parent button
        if (parentRef?.current && parentRef.current.contains(event.target)) {
          return; // Let the parent handle toggle
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, parentRef]);

  // Focus the active item when the dropdown opens (falls back to first item)
  useEffect(() => {
    if (isOpen && menuItemsRef.current.length > 0) {
      // Small delay to ensure DOM is ready
      const id = setTimeout(() => {
        const focusIndex = activeIndex >= 0 ? activeIndex : 0;
        menuItemsRef.current[focusIndex]?.focus();
      }, 10);
      return () => clearTimeout(id);
    }
  }, [isOpen, activeIndex]);

  // Handle keyboard navigation within dropdown
  const handleKeyDown = useCallback((e, itemIndex, totalItems) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onEscape?.();
        break;
      case 'Tab':
        // Allow Tab to navigate within dropdown
        if (e.shiftKey) {
          // Shift+Tab - go to previous item
          if (itemIndex === 0) {
            // At first item, close dropdown and return focus to parent
            e.preventDefault();
            onEscape?.();
          }
          // Otherwise, let default Tab behavior work (focus previous item)
        } else {
          // Tab - go to next item
          if (itemIndex === totalItems - 1) {
            // At last item, close dropdown and continue to next focusable element
            onClose();
          }
          // Otherwise, let default Tab behavior work (focus next item)
        }
        break;
      default:
        break;
    }
  }, [onClose, onEscape]);

  if (!isOpen) return null;

  // Reuse the flattened item list for ref indexing
  const allItems = flatItems;
  let itemRefIndex = 0;

  return (
    <div
      ref={dropdownRef}
      id={menuId}
      role="menu"
      aria-label="Submenu"
      className="navbar-dropdown-menu"
      style={{
        position: 'absolute',
        top: '100%',
        left: '-44px',
        display: 'flex',
        width: '344px',
        padding: '32px 52px 52px 52px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        background: 'var(--sap-white, #FFF)',
        boxShadow: '0 10px 30px 0 rgba(34, 54, 73, 0.25)',
        zIndex: 1001,
        ...style,
      }}
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} style={{ width: '100%' }} role="group" aria-label={group.label}>
          {/* Group Header */}
          <div
            id={`${menuId}-group-${groupIndex}`}
            style={{
              fontFamily: '"72 Brand", "72", "72full", Arial, Helvetica, sans-serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '15px',
              color: 'var(--sap-black, #000)',
              padding: '8px 12px 12px 8px',
            }}
          >
            {group.label}
          </div>
          {/* Separator Line */}
          <div
            role="separator"
            style={{
              width: '100%',
              height: '1px',
              background: 'var(--sap-grey3, #D5DADD)',
            }}
          />
          {/* Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column' }} role="group">
            {group.items.map((item, itemIndex) => {
              const currentRefIndex = itemRefIndex++;
              const itemActive = currentRefIndex === activeIndex;
              const restColor = itemActive
                ? 'var(--sap-blue7, #0070F2)'
                : 'var(--sap-black, #000)';
              return (
                <a
                  key={itemIndex}
                  ref={el => menuItemsRef.current[currentRefIndex] = el}
                  href={item.href || item.to}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  role="menuitem"
                  tabIndex={0}
                  aria-current={itemActive ? 'page' : undefined}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                      onClose();
                    } else if (!item.external) {
                      e.preventDefault();
                      history.push(item.to || item.href);
                      onClose();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (item.onClick) {
                        item.onClick();
                        onClose();
                      } else if (item.external) {
                        window.open(item.href || item.to, '_blank');
                        onClose();
                      } else {
                        history.push(item.to || item.href);
                        onClose();
                      }
                    } else {
                      handleKeyDown(e, currentRefIndex, allItems.length);
                    }
                  }}
                  style={{
                    fontFamily: '"72 Brand", "72", "72full", Arial, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: itemActive ? 500 : 400,
                    lineHeight: '15px',
                    color: restColor,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                    padding: '8px 12px 8px 8px',
                    marginTop: itemIndex === 0 ? '12px' : '0',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--sap-blue7, #0070F2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = restColor;
                  }}
                  onFocus={(e) => {
                    e.target.style.color = 'var(--sap-blue7, #0070F2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.color = restColor;
                  }}
                >
                  {item.label}
                  {item.external && <span className="visually-hidden"> (opens in new tab)</span>}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Navbar() {
  const { navbar } = useThemeConfig();
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();
  const history = useHistory();

  // All URLs must be declared before any state that depends on them
  const homeUrl = useBaseUrl('/');
  const logoUrl = useBaseUrl('/img/logos/sap-logo-svg.svg');
  const downloadUrl = useBaseUrl('/download');
  const docsUrl = useBaseUrl('/docs');
  const articlesUrl = useBaseUrl('/articles');
  const articlesGettingStartedUrl = useBaseUrl('/articles/getting-started');
  const articlesBestPracticesUrl = useBaseUrl('/articles/best-practices');
  const articlesReleaseNotesUrl = useBaseUrl('/articles/release-notes');
  const faqUrl = useBaseUrl('/frequently-asked-questions');
  const jmcUrl = useBaseUrl('/jmc');
  const bubbleLogoUrl = useBaseUrl('/img/logos/logo-bubble.png');
  const bubbleLogoXmasUrl = useBaseUrl('/img/logos/logo-xmas-bubble.png');
  const bubbleLogo = new Date().getMonth() === 11 ? bubbleLogoXmasUrl : bubbleLogoUrl;

  const makeUrl = (path) => siteConfig.baseUrl.replace(/\/$/, '') + path;

  // Determine which docs section the current page lives in
  const usingSapMachineUrls = usingSection.map(item => makeUrl(item.path));
  const featuresUrls = featuresSection.map(item => makeUrl(item.path));
  const generalUrls = generalSection.map(item => makeUrl(item.path));
  const currentPathInUsing = usingSapMachineUrls.some(u => location.pathname === u || location.pathname.startsWith(u));
  const currentPathInFeatures = featuresUrls.some(u => location.pathname === u || location.pathname.startsWith(u));
  const currentPathInGeneral = generalUrls.some(u => location.pathname === u || location.pathname.startsWith(u));
  const currentPathInDocs = currentPathInUsing || currentPathInFeatures || currentPathInGeneral ||
    location.pathname === docsUrl || location.pathname.startsWith(docsUrl);

  const [downloadPopoverOpen, setDownloadPopoverOpen] = useState(false);
  const [articlesPopoverOpen, setArticlesPopoverOpen] = useState(false);
  const [explorePopoverOpen, setExplorePopoverOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [mobileDownloadOpen, setMobileDownloadOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);
  const [mobileDocsSectionOpen, setMobileDocsSectionOpen] = useState(currentPathInUsing);
  const [mobileDocsFeaturesSectionOpen, setMobileDocsFeaturesSectionOpen] = useState(currentPathInFeatures);
  const [mobileDocsGeneralSectionOpen, setMobileDocsGeneralSectionOpen] = useState(currentPathInGeneral);
  const downloadButtonRef = useRef(null);
  const articlesButtonRef = useRef(null);
  const exploreButtonRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExploreOpen(false);
    setMobileDownloadOpen(false);
    setMobileDocsOpen(false);
  }, [location.pathname]);

  // Keep docs section open states in sync with current page
  useEffect(() => {
    setMobileDocsSectionOpen(currentPathInUsing);
    setMobileDocsFeaturesSectionOpen(currentPathInFeatures);
    setMobileDocsGeneralSectionOpen(currentPathInGeneral);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navigateTo = (path, external = false) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      history.push(path);
    }
  };

  const handleMobileNav = (path) => {
    if (location.pathname === path || location.pathname === path.replace(/\/$/, '')) {
      setMobileMenuOpen(false);
    } else {
      history.push(path);
    }
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === homeUrl || path === homeUrl.replace(/\/$/, '')) {
      return location.pathname === homeUrl || location.pathname === homeUrl.replace(/\/$/, '');
    }
    // For Download nav item, also check if we're on the JMC page
    if (path === downloadUrl) {
      return location.pathname.startsWith(path) || location.pathname.startsWith(jmcUrl);
    }
    return location.pathname.startsWith(path);
  };

  // Navigation items configuration
  const navItems = [
    { label: 'Home', to: homeUrl, position: 'left', showChevron: false },
    { label: 'Download', to: downloadUrl, position: 'left', hasDropdown: true, dropdownType: 'download', showChevron: true },
    { label: 'Documentation', to: docsUrl, position: 'left', hasDropdown: false, dropdownType: 'docs', showChevron: true },
    { label: 'FAQ', to: faqUrl, position: 'left', showChevron: false },
  ];

  // Download dropdown groups
  const downloadGroups = [
    {
      label: 'Products',
      items: [
        { label: 'SapMachine', to: downloadUrl },
        { label: 'JMC', to: jmcUrl },
      ],
    },
  ];

  // Explore SAP dropdown groups
  const exploreSAPGroups = [
    {
      label: 'SAP Resources',
      items: [
        { label: 'SAP.com', href: 'https://www.sap.com', external: true },
        { label: 'SAP Community', href: 'https://community.sap.com', external: true },
        { label: 'SAP Developers', href: 'https://developers.sap.com', external: true },
        { label: 'SAP Learning', href: 'https://learning.sap.com', external: true },
      ],
    },
  ];

  const handleDropdownToggle = (dropdownType) => {
    if (dropdownType === 'download') {
      setDownloadPopoverOpen(!downloadPopoverOpen);
      setArticlesPopoverOpen(false);
      setExplorePopoverOpen(false);
    } else if (dropdownType === 'articles') {
      setArticlesPopoverOpen(!articlesPopoverOpen);
      setDownloadPopoverOpen(false);
      setExplorePopoverOpen(false);
    } else if (dropdownType === 'explore') {
      setExplorePopoverOpen(!explorePopoverOpen);
      setDownloadPopoverOpen(false);
      setArticlesPopoverOpen(false);
    }
  };

  const getRefForDropdown = (dropdownType) => {
    if (dropdownType === 'download') return downloadButtonRef;
    if (dropdownType === 'articles') return articlesButtonRef;
    return null;
  };

  return (
    <>
      {/* Skip to Main Content - First focusable element */}
      <a
        href="#main-content"
        className="skip-to-main-content"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="navbar navbar--fixed-top"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#F5F6F7',
          borderBottom: 'none',
          height: '56px',
          fontFamily: '"72", "72full", Arial, Helvetica, sans-serif',
        }}
      >
        <nav aria-label="Main navigation" style={{ height: '100%', width: '100%' }}>
          <div className="grid-container" style={{ height: '100%' }}>
            <FlexBox
              alignItems={FlexBoxAlignItems.Center}
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              style={{ height: '100%', width: '100%' }}
            >
              {/* Left side - Logo and Navigation */}
              <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '8px', height: '100%' }}>
                {/* SAP Logo - First focusable element in navbar */}
                <a
                  href={homeUrl}
                  className="navbar-logo-link"
                  aria-label="SAP - Go to homepage"
                >
                  <img
                    src={logoUrl}
                    alt=""
                    aria-hidden="true"
                    style={{ height: '32px' }}
                  />
                </a>
                
                {/* SapMachine Title */}
                <a
                  href={homeUrl}
                  className="navbar-title"
                >
                  <span className="navbar-title-text">{navbar.title || siteConfig.title || 'SapMachine'}</span>
                </a>

                {/* Navigation Items - desktop only */}
                <div
                  className="navbar-desktop-nav"
                  style={{ display: 'flex', alignItems: 'stretch', height: '56px' }}
                  role="menubar"
                  aria-label="Main menu"
                >
                  {navItems.map((item, index) => {
                    // Check if this item's dropdown is open
                    const isDropdownOpen = 
                      (item.dropdownType === 'download' && downloadPopoverOpen) ||
                      (item.dropdownType === 'articles' && articlesPopoverOpen);
                    
                    // Check if ANY dropdown is open (including Explore SAP)
                    const anyDropdownOpen = downloadPopoverOpen || articlesPopoverOpen || explorePopoverOpen;
                    
                    // Determine if this nav item should show active state:
                    // - If ANY dropdown is open, only the item with the open dropdown is active
                    // - If NO dropdown is open, use page-based active state
                    const shouldShowActive = anyDropdownOpen 
                      ? isDropdownOpen 
                      : isActive(item.to);
                    
                    const menuId = item.hasDropdown ? `navbar-menu-${item.dropdownType}` : undefined;
                    const buttonRef = getRefForDropdown(item.dropdownType);
                    
                    // Handler to close dropdown and return focus to parent
                    const handleEscapeAndFocus = () => {
                      if (item.dropdownType === 'download') {
                        setDownloadPopoverOpen(false);
                        downloadButtonRef.current?.focus();
                      } else if (item.dropdownType === 'articles') {
                        setArticlesPopoverOpen(false);
                        articlesButtonRef.current?.focus();
                      }
                    };
                    
                    return (
                      <div
                        key={index}
                        ref={buttonRef}
                        className="navbar-nav-item"
                        tabIndex={0}
                        role="menuitem"
                        aria-haspopup={item.hasDropdown ? "menu" : undefined}
                        aria-expanded={item.hasDropdown ? isDropdownOpen : undefined}
                        aria-controls={item.hasDropdown ? menuId : undefined}
                        aria-current={shouldShowActive && !item.hasDropdown ? "page" : undefined}
                        style={{ position: 'relative' }}
                        onClick={() => {
                          if (item.hasDropdown) {
                            handleDropdownToggle(item.dropdownType);
                          } else {
                            navigateTo(item.to);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (item.hasDropdown) {
                              handleDropdownToggle(item.dropdownType);
                            } else {
                              navigateTo(item.to);
                            }
                          } else if (e.key === 'Escape' && isDropdownOpen) {
                            e.preventDefault();
                            handleEscapeAndFocus();
                          } else if (e.key === 'ArrowDown' && item.hasDropdown && !isDropdownOpen) {
                            // Open dropdown with arrow down
                            e.preventDefault();
                            handleDropdownToggle(item.dropdownType);
                          }
                        }}
                      >
                        <span
                          className={`navbar-nav-text ${shouldShowActive ? 'navbar-nav-text-active' : ''}`}
                        >
                          {item.label}
                          {item.hasDropdown && (
                            <Icon
                              name={isDropdownOpen ? "slim-arrow-up" : "slim-arrow-down"}
                              className="navbar-nav-arrow"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        
                        {/* Download Dropdown */}
                        {item.dropdownType === 'download' && (
                          <DropdownMenu
                            isOpen={downloadPopoverOpen}
                            onClose={() => setDownloadPopoverOpen(false)}
                            onEscape={handleEscapeAndFocus}
                            groups={downloadGroups}
                            menuId={menuId}
                            parentRef={downloadButtonRef}
                            currentPath={location.pathname}
                          />
                        )}
                        
                        {/* Articles Dropdown */}
                        {item.dropdownType === 'articles' && (
                          <DropdownMenu
                            isOpen={articlesPopoverOpen}
                            onClose={() => setArticlesPopoverOpen(false)}
                            onEscape={handleEscapeAndFocus}
                            groups={articlesGroups}
                            menuId={menuId}
                            parentRef={articlesButtonRef}
                            currentPath={location.pathname}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </FlexBox>

              {/* Right side - Explore SAP (desktop only), Hamburger (mobile only) */}
              <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0px', height: '100%' }}>
                {/* Explore SAP Dropdown - desktop only */}
                <div
                  className="navbar-desktop-nav navbar-nav-item"
                  ref={exploreButtonRef}
                  tabIndex={0}
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={explorePopoverOpen}
                  aria-controls="navbar-menu-explore"
                  style={{ position: 'relative' }}
                  onClick={() => handleDropdownToggle('explore')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDropdownToggle('explore');
                    } else if (e.key === 'Escape' && explorePopoverOpen) {
                      e.preventDefault();
                      setExplorePopoverOpen(false);
                      exploreButtonRef.current?.focus();
                    } else if (e.key === 'ArrowDown' && !explorePopoverOpen) {
                      e.preventDefault();
                      handleDropdownToggle('explore');
                    }
                  }}
                >
                  <span className={`navbar-nav-text ${explorePopoverOpen ? 'navbar-nav-text-active' : ''}`}>
                    Explore SAP
                    <Icon
                      name={explorePopoverOpen ? "slim-arrow-up" : "slim-arrow-down"}
                      className="navbar-nav-arrow"
                      aria-hidden="true"
                    />
                  </span>
                  
                  <DropdownMenu
                    isOpen={explorePopoverOpen}
                    onClose={() => setExplorePopoverOpen(false)}
                    onEscape={() => {
                      setExplorePopoverOpen(false);
                      exploreButtonRef.current?.focus();
                    }}
                    groups={exploreSAPGroups}
                    menuId="navbar-menu-explore"
                    parentRef={exploreButtonRef}
                    currentPath={location.pathname}
                    style={{ right: 0, left: 'auto' }}
                  />
                </div>

                {/* Hamburger button - mobile only */}
                <button
                  className="navbar-hamburger"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav-menu"
                  onClick={() => {
                    if (mobileMenuOpen) {
                      setMobileMenuOpen(false);
                    } else {
                      setMobileMenuOpen(true);
                      if (currentPathInDocs) setMobileDocsOpen(true);
                      else if (location.pathname.startsWith(downloadUrl) || location.pathname.startsWith(jmcUrl)) setMobileDownloadOpen(true);
                    }
                  }}
                >
                  {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
                </button>
              </FlexBox>
            </FlexBox>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="mobile-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Main panel */}
          {!mobileExploreOpen && !mobileDownloadOpen && !mobileDocsOpen && (
            <>
              <nav aria-label="Mobile navigation">
                <div className="mobile-nav-logo">
                  <img src={bubbleLogo} alt="SapMachine" />
                </div>
                <ul className="mobile-nav-list">
                  {navItems.map((item, index) => {
                    const isActive = !item.hasDropdown && (
                      location.pathname === item.to ||
                      (item.to !== homeUrl && location.pathname.startsWith(item.to))
                    );
                    return (
                      <li key={index} className={`mobile-nav-item${item.label === 'FAQ' ? ' mobile-nav-item-last' : ''}`}>
                        <a
                          href={item.to}
                          className={`mobile-nav-link${isActive ? ' mobile-nav-link--active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.dropdownType === 'download') {
                              setMobileDownloadOpen(true);
                            } else if (item.dropdownType === 'docs') {
                              setMobileDocsOpen(true);
                            } else if (location.pathname === item.to || location.pathname === item.to.replace(/\/$/, '')) {
                              setMobileMenuOpen(false);
                            } else {
                              history.push(item.to);
                            }
                          }}                        >
                          <span>{item.label}</span>
                          {item.showChevron && <ChevronRightIcon />}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Separator + gap before Explore SAP */}
              <div className="mobile-nav-explore-separator" />

              {/* Explore SAP — pinned blue row, opens sub-panel */}
              <div className="mobile-nav-explore">
                <button
                  className="mobile-nav-explore-link"
                  onClick={() => setMobileExploreOpen(true)}
                >
                  <span>Explore SAP</span>
                  <ChevronRightIcon />
                </button>
              </div>
            </>
          )}

          {/* Download sub-panel */}
          {mobileDownloadOpen && (
            <>
              <div className="mobile-nav-subpanel-header">
                <button
                  className="mobile-nav-back"
                  aria-label="Back to main menu"
                  onClick={() => setMobileDownloadOpen(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="mobile-nav-subpanel-title">Download</span>
                <div style={{ width: '32px', flexShrink: 0 }} />
              </div>
              <div className="mobile-nav-subpanel-separator" />
              <nav aria-label="Download navigation">
                <ul className="mobile-nav-list" style={{ paddingTop: 0, paddingBottom: '40px' }}>
                  {downloadGroups.flatMap(g => g.items).map((item, index, arr) => (
                    <li key={index} className={`mobile-nav-item${index === arr.length - 1 ? ' mobile-nav-item-last' : ''}`}>
                      <a
                        href={item.to}
                        className={`mobile-nav-link${location.pathname === item.to || location.pathname.startsWith(item.to) ? ' mobile-nav-link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); location.pathname === item.to ? setMobileMenuOpen(false) : history.push(item.to); }}
                      >
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}

          {/* Documentation sub-panel */}
          {mobileDocsOpen && (
            <>
              <div className="mobile-nav-subpanel-header">
                <button
                  className="mobile-nav-back"
                  aria-label="Back to main menu"
                  onClick={() => setMobileDocsOpen(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="mobile-nav-subpanel-title">Documentation</span>
                <div style={{ width: '32px', flexShrink: 0 }} />
              </div>
              <div className="mobile-nav-subpanel-separator" />
              <nav aria-label="Documentation navigation">
                <ul className="mobile-nav-list" style={{ paddingTop: 0, paddingBottom: '40px' }}>
                  {/* Content Overview */}
                  <li className="mobile-nav-item">
                    <a
                      href={docsUrl}
                      className={`mobile-nav-link${location.pathname === docsUrl ? ' mobile-nav-link--active' : ''}`}
                      onClick={(e) => { e.preventDefault(); handleMobileNav(docsUrl); }}
                    >
                      <span>Content Overview</span>
                    </a>
                  </li>

                  {/* Using SapMachine — collapsible section */}
                  <li className="mobile-nav-item">
                    <button
                      className="mobile-nav-link mobile-nav-section-toggle"
                      onClick={() => setMobileDocsSectionOpen(!mobileDocsSectionOpen)}
                    >
                      <span>Using SapMachine</span>
                      <svg className={`mobile-nav-section-arrow${mobileDocsSectionOpen ? ' mobile-nav-section-arrow--open' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                  <div className={`mobile-nav-section-body${mobileDocsSectionOpen ? ' mobile-nav-section-body--open' : ''}`}>
                    {usingSection.map((item, index) => {
                      const url = makeUrl(item.path);
                      return (
                        <li key={item.path} className={`mobile-nav-item mobile-nav-item-indented${index === usingSection.length - 1 ? ' mobile-nav-item-last' : ''}`}>
                          <a href={url} className={`mobile-nav-link${location.pathname === url ? ' mobile-nav-link--active' : ''}`} onClick={(e) => { e.preventDefault(); handleMobileNav(url); }}>
                            <span>{item.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </div>

                  {/* Features — collapsible section */}
                  <li className="mobile-nav-item">
                    <button
                      className="mobile-nav-link mobile-nav-section-toggle"
                      onClick={() => setMobileDocsFeaturesSectionOpen(!mobileDocsFeaturesSectionOpen)}
                    >
                      <span>Features</span>
                      <svg className={`mobile-nav-section-arrow${mobileDocsFeaturesSectionOpen ? ' mobile-nav-section-arrow--open' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                  <div className={`mobile-nav-section-body${mobileDocsFeaturesSectionOpen ? ' mobile-nav-section-body--open' : ''}`}>
                    {featuresSection.map((item, index) => {
                      const url = makeUrl(item.path);
                      return (
                        <li key={item.path} className={`mobile-nav-item mobile-nav-item-indented${index === featuresSection.length - 1 ? ' mobile-nav-item-last' : ''}`}>
                          <a href={url} className={`mobile-nav-link${location.pathname === url ? ' mobile-nav-link--active' : ''}`} onClick={(e) => { e.preventDefault(); handleMobileNav(url); }}>
                            <span>{item.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </div>

                  {/* General — collapsible section */}
                  <li className="mobile-nav-item">
                    <button
                      className="mobile-nav-link mobile-nav-section-toggle"
                      onClick={() => setMobileDocsGeneralSectionOpen(!mobileDocsGeneralSectionOpen)}
                    >
                      <span>General</span>
                      <svg className={`mobile-nav-section-arrow${mobileDocsGeneralSectionOpen ? ' mobile-nav-section-arrow--open' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                  <div className={`mobile-nav-section-body${mobileDocsGeneralSectionOpen ? ' mobile-nav-section-body--open' : ''}`}>
                    {generalSection.map((item, index) => {
                      const url = makeUrl(item.path);
                      return (
                        <li key={item.path} className={`mobile-nav-item mobile-nav-item-indented${index === generalSection.length - 1 ? ' mobile-nav-item-last' : ''}`}>
                          <a href={url} className={`mobile-nav-link${location.pathname === url ? ' mobile-nav-link--active' : ''}`} onClick={(e) => { e.preventDefault(); handleMobileNav(url); }}>
                            <span>{item.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </div>
                </ul>
              </nav>
            </>
          )}

          {/* Explore SAP sub-panel */}
          {mobileExploreOpen && (
            <>
              <div className="mobile-nav-subpanel-header">
                <button
                  className="mobile-nav-back"
                  aria-label="Back to main menu"
                  onClick={() => setMobileExploreOpen(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="mobile-nav-subpanel-title">Explore SAP</span>
                <div style={{ width: '32px', flexShrink: 0 }} />
              </div>
              <div className="mobile-nav-subpanel-separator" />
              <nav aria-label="Explore SAP navigation">
                <ul className="mobile-nav-list" style={{ paddingTop: 0, paddingBottom: '40px' }}>
                  {exploreSAPGroups.flatMap(g => g.items).map((item, index, arr) => (
                    <li key={index} className={`mobile-nav-item${index === arr.length - 1 ? ' mobile-nav-item-last' : ''}`}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-nav-link"
                      >
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}
        </div>
      )}
    </>
  );
}