// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocItemFooter from "@theme/DocItem/Footer";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocItemContent from "@theme/DocItem/Content";
import ContentVisibility from "@theme/ContentVisibility";
import DocSidebar from "@theme/DocSidebar";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

function DocItemLayout({ children }) {
  const doc = useDoc();
  const { metadata, frontMatter, toc } = doc;
  const { title } = metadata;
  const { hide_table_of_contents: hideTableOfContents } = frontMatter;

  const canRenderTOC = !hideTableOfContents && toc.length > 0;

  const defaultHeaderImage = useBaseUrl('/img/logos/logo-bubble.png');
  const christmasHeaderImage = useBaseUrl('/img/logos/logo-xmas-bubble.png');

  // automatically changes the header image to the x-mas one once it hits december
  const HeaderImage = new Date().getMonth() === 11 ? christmasHeaderImage : defaultHeaderImage;

  return (
    <>
      {/* Hero Header - full width */}
      <div className="hero-header">
        <div className="grid-container">
          <div className="grid-row" style={{ alignItems: 'center' }}>
            <div className="grid-col grid-col-8">
              <h1
                className="hero-heading"
                style={{ color: "var(--sap-white)", margin: '0 0 24px 0' }}
              >
                {title}
              </h1>
              {frontMatter.description && (
                <p
                  className="hero-paragraph"
                  style={{ color: "var(--sap-white)", maxWidth: '800px', margin: 0 }}
                >
                  {frontMatter.description}
                </p>
              )}
            </div>
            <div className="grid-col grid-col-4" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <img
                src={HeaderImage}
                alt="Logo of SapMachine"
                className="hero-header-logo"
                style={{ maxHeight: '120px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="grid-container">
        <div className={`grid-row ${styles.docsRow}`}>
          {/* Sticky sidebar */}
          <div
            className={`grid-col grid-col-3 ${styles.sidebarCol}`}
          >
            <DocSidebar />
          </div>

          {/* Main content */}
          <div className={`grid-col grid-col-9 ${styles.contentCol}`}>
            <ContentVisibility metadata={metadata} />
            <DocVersionBanner />
            <div className={styles.docItemContainer}>
              {canRenderTOC && <DocItemTOCMobile />}
              <article id="main-content">
                <DocVersionBadge />
                <DocItemContent>{children}</DocItemContent>
                <DocItemFooter />
              </article>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DocItemLayout;
