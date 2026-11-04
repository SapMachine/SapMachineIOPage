// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

/**
 * Custom DocSidebar Component
 * Automatically reads from Docusaurus sidebar configuration
 * Design: Light blue background with straight blue left indicator when active
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useLocation, useHistory } from '@docusaurus/router';
import useBaseUrl, { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/text-align-left.js';
import '@ui5/webcomponents-icons/dist/begin.js';
import '@ui5/webcomponents-icons/dist/business-objects-mobile.js';
import '@ui5/webcomponents-icons/dist/detail-more.js';
import styles from './styles.module.css';

// Context to manage expansion state globally
const ExpansionContext = createContext({
  expandedItems: {},
  toggleExpanded: () => {},
});

const useExpansion = () => useContext(ExpansionContext);

// Icon mapping for 1st level categories
const categoryIcons = {
  'Content': 'text-align-left',
  'Using SapMachine': 'begin',
  'Features': 'business-objects-mobile',
  'General': 'detail-more',
};

// Arrow icon component - using SAP grey7 (#475E75)
const ArrowIcon = ({ expanded }) => (
  <svg
    className={`${styles.arrowIcon} ${expanded ? styles.arrowExpanded : ''}`}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 4L10 8L6 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 3rd level sidebar item (leaf node in nested category)
const SidebarItemLevel3 = ({ item, isActive }) => {
  const history = useHistory();
  const { withBaseUrl } = useBaseUrlUtils();

  const navigate = (href) => {
    if (!href) return;
    if (href.includes('#')) {
      const [pathname, hash] = href.split('#');
      history.push({ pathname: withBaseUrl(pathname), hash: `#${hash}` });
    } else {
      history.push(withBaseUrl(href));
    }
  };

  const handleClick = () => navigate(item.href);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(item.href);
    }
  };

  return (
    <div
      className={`${styles.sidebarItemLevel3} ${isActive ? styles.sidebarItemActive : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && <div className={styles.activeIndicator} />}
      <span className={styles.itemLabel}>{item.label}</span>
    </div>
  );
};

// 2nd level sidebar item (leaf node)
const SidebarItem = ({ item, isActive }) => {
  const history = useHistory();
  const { withBaseUrl } = useBaseUrlUtils();

  const navigate = (href) => {
    if (!href) return;
    if (href.includes('#')) {
      const [pathname, hash] = href.split('#');
      history.push({ pathname: withBaseUrl(pathname), hash: `#${hash}` });
    } else {
      history.push(withBaseUrl(href));
    }
  };

  const handleClick = () => navigate(item.href);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(item.href);
    }
  };

  return (
    <div
      className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && <div className={styles.activeIndicator} />}
      <span className={styles.itemLabel}>{item.label}</span>
    </div>
  );
};

// 2nd level nested category (e.g., Download and Installation)
const NestedCategory = ({ category, activeHref }) => {
  const { expandedItems, toggleExpanded } = useExpansion();
  const categoryKey = `nested-${category.label}`;
  const expanded = expandedItems[categoryKey] ?? false;
  const history = useHistory();
  const location = useLocation();
  const { withBaseUrl } = useBaseUrlUtils();

  // Scroll-spy: track which section heading is currently at the top of the viewport
  const [activeSection, setActiveSection] = useState(null);
  const activeSectionRef = useRef(null);

  const hashIds = (category.items ?? [])
    .filter(item => item.href?.includes('#'))
    .map(item => item.href.split('#')[1]);

  const basePath = category.href ? category.href.split('#')[0] : null;
  const resolvedBase = basePath ? withBaseUrl(basePath).replace(/\/$/, '') : null;
  const isOnRelevantPage = !!(resolvedBase && location.pathname.replace(/\/$/, '') === resolvedBase);

  useEffect(() => {
    if (!isOnRelevantPage || !hashIds.length) {
      setActiveSection(null);
      activeSectionRef.current = null;
      return;
    }

    const updateActiveSection = () => {
      // Section is "active" as soon as its heading enters the lower ~70% of the viewport
      const threshold = window.innerHeight * 0.3;
      let current = hashIds[0];
      for (const id of hashIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= threshold) {
          current = id;
        }
      }
      if (current !== activeSectionRef.current) {
        activeSectionRef.current = current;
        setActiveSection(current);
      }
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, [isOnRelevantPage, hashIds.join(',')]);

  // When a hash-link is clicked, re-run the scroll-spy after the browser scrolls
  useEffect(() => {
    if (!isOnRelevantPage) return;
    const hash = location.hash.replace('#', '');
    if (hash && hashIds.includes(hash)) {
      requestAnimationFrame(() => {
        const threshold = window.innerHeight * 0.3;
        let current = hashIds[0];
        for (const id of hashIds) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= threshold) {
            current = id;
          }
        }
        activeSectionRef.current = current;
        setActiveSection(current);
      });
    }
  }, [location.hash]);

  // For type:link items, active means current pathname matches and (if hash present) current hash matches
  const isLinkActive = (href) => {
    if (!href) return false;
    const [pathname, hash] = href.split('#');
    const resolvedPathname = withBaseUrl(pathname).replace(/\/$/, '');
    const currentPathname = location.pathname.replace(/\/$/, '');
    if (resolvedPathname !== currentPathname) return false;
    if (hash) {
      if (activeSection !== null) return activeSection === hash;
      return location.hash === `#${hash}`;
    }
    return true;
  };

  // Check if any child hash-item is active
  const hasActiveItem = category.items?.some((item) => isLinkActive(item.href));

  // Auto-expand if on the relevant page or a child item is active (only on initial mount)
  useEffect(() => {
    if ((isOnRelevantPage || hasActiveItem) && !expandedItems[categoryKey]) {
      toggleExpanded(categoryKey, true);
    }
  }, []); // Only run on mount

  const handleLabelClick = () => {
    if (category.href) {
      history.push(category.href);
    }
    if (category.items && category.items.length > 0) {
      toggleExpanded(categoryKey, !expanded);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    if (category.items && category.items.length > 0) {
      toggleExpanded(categoryKey, !expanded);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLabelClick();
    }
  };

  return (
    <div className={styles.nestedCategory}>
      <div
        className={styles.nestedCategoryHeader}
        onClick={handleLabelClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-controls={`nested-category-${category.label.replace(/\s+/g, '-')}`}
      >
        <span className={styles.categoryLabel}>{category.label}</span>
        {category.items && category.items.length > 0 && (
          <span onClick={handleArrowClick} style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowIcon expanded={expanded} />
          </span>
        )}
      </div>
      {expanded && category.items && category.items.length > 0 && (
        <div
          id={`nested-category-${category.label.replace(/\s+/g, '-')}`}
          className={styles.nestedCategoryItems}
        >
          {category.items.map((item, index) => {
            // 3rd level items
            const isItemActive = isLinkActive(item.href);
            return <SidebarItemLevel3 key={index} item={item} isActive={isItemActive} />;
          })}
        </div>
      )}
    </div>
  );
};

// 1st level sidebar category (Content, Using SapMachine, Features, General)
const SidebarCategory = ({ category, activeHref }) => {
  const { expandedItems, toggleExpanded } = useExpansion();
  const categoryKey = `category-${category.label}`;
  const expanded = expandedItems[categoryKey] ?? false;
  const history = useHistory();

  // Check if any item in this category (or nested categories) is active
  const checkActiveRecursive = (items) => {
    if (!items) return false;
    return items.some((item) => {
      if (item.href) {
        const normalizedHref = item.href.replace(/\/$/, '');
        const normalizedActive = activeHref.replace(/\/$/, '');
        if (normalizedHref === normalizedActive) return true;
      }
      if (item.items) {
        return checkActiveRecursive(item.items);
      }
      return false;
    });
  };

  const hasActiveItem = checkActiveRecursive(category.items);

  // Auto-expand if has active item (only on initial mount)
  useEffect(() => {
    if (hasActiveItem && !expandedItems[categoryKey]) {
      toggleExpanded(categoryKey, true);
    }
  }, []); // Only run on mount

  const handleLabelClick = () => {
    if (category.href) {
      history.push(category.href);
    }
    if (category.items && category.items.length > 0) {
      toggleExpanded(categoryKey, !expanded);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    if (category.items && category.items.length > 0) {
      toggleExpanded(categoryKey, !expanded);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLabelClick();
    }
  };

  // Get the icon for this category
  const iconName = categoryIcons[category.label];

  return (
    <div className={styles.sidebarCategory}>
      <div
        className={styles.categoryHeader}
        onClick={handleLabelClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-controls={`category-${category.label.replace(/\s+/g, '-')}`}
      >
        {iconName && (
          <Icon name={iconName} className={styles.categoryIcon} />
        )}
        <span className={styles.categoryLabel}>{category.label}</span>
        {category.items && category.items.length > 0 && (
          <span onClick={handleArrowClick} style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowIcon expanded={expanded} />
          </span>
        )}
      </div>
      {expanded && category.items && category.items.length > 0 && (
        <div
          id={`category-${category.label.replace(/\s+/g, '-')}`}
          className={styles.categoryItems}
        >
          {category.items.map((item, index) => {
            if (item.type === 'category') {
              // 2nd level nested category (e.g., Download and Installation)
              return <NestedCategory key={index} category={item} activeHref={activeHref} />;
            }
            // 2nd level regular item (link)
            const normalizedHref = item.href ? item.href.replace(/\/$/, '') : '';
            const normalizedActive = activeHref.replace(/\/$/, '');
            const isItemActive = normalizedHref === normalizedActive;
            return <SidebarItem key={index} item={item} isActive={isItemActive} />;
          })}
        </div>
      )}
    </div>
  );
};

// Top-level link item (like Content which is a link, not a category)
const TopLevelItem = ({ item, isActive }) => {
  const history = useHistory();
  const iconName = categoryIcons[item.label];

  const handleClick = () => {
    if (item.href) {
      history.push(item.href);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (item.href) {
        history.push(item.href);
      }
    }
  };

  return (
    <div
      className={`${styles.categoryHeader} ${isActive ? styles.sidebarItemActive : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-current={isActive ? 'page' : undefined}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {isActive && <div className={styles.activeIndicator} />}
      {iconName && (
        <Icon name={iconName} className={styles.categoryIcon} />
      )}
      <span className={styles.categoryLabel}>{item.label}</span>
    </div>
  );
};

// Main DocSidebar component
function DocSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const sidebar = useDocsSidebar();
  
  // Global expansion state management
  const [expandedItems, setExpandedItems] = useState(() => {
    // Try to restore from sessionStorage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('sidebarExpansion');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });

  const toggleExpanded = useCallback((key, value) => {
    setExpandedItems(prev => {
      const newState = { ...prev, [key]: value };
      // Save to sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sidebarExpansion', JSON.stringify(newState));
      }
      return newState;
    });
  }, []);

  // If no sidebar data, return null
  if (!sidebar || !sidebar.items) {
    return null;
  }

  return (
    <ExpansionContext.Provider value={{ expandedItems, toggleExpanded }}>
      <nav className={styles.sidebarContainer} aria-label="Documentation navigation">
        <div className={styles.sidebarContent}>
          {sidebar.items.map((item, index) => {
            if (item.type === 'category') {
              return <SidebarCategory key={index} category={item} activeHref={currentPath} />;
            }
            // Top-level link item (like Content)
            const normalizedHref = item.href ? item.href.replace(/\/$/, '') : '';
            const normalizedActive = currentPath.replace(/\/$/, '');
            const isItemActive = normalizedHref === normalizedActive;
            return <TopLevelItem key={index} item={item} isActive={isItemActive} />;
          })}
        </div>
      </nav>
    </ExpansionContext.Provider>
  );
}

export default DocSidebar;