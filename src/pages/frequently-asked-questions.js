// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React from 'react';
import Layout from '@theme/Layout';
import FAQContent from './_faq-content.md';
import useBaseUrl from '@docusaurus/useBaseUrl';

function FAQHeader() {
  const defaultHeaderImage = useBaseUrl('/img/logos/logo-bubble.png');
  const christmasHeaderImage = useBaseUrl('/img/logos/logo-xmas-bibble.png');

  // automatically changes the header image to the x-mas one once it hits december
  const headerImage = new Date().getMonth() === 11 ? christmasHeaderImage : defaultHeaderImage;

  return (
    <div className="hero-header">
      <div className="grid-container">
        <div className="grid-row" style={{ alignItems: 'center' }}>
          <div className="grid-col grid-col-8">
            <h1 className="hero-heading" style={{ color: 'var(--sap-white)', margin: '0 0 24px 0' }}>
              Frequently Asked Questions
            </h1>
            <p className="hero-paragraph" style={{ color: 'var(--sap-white)', maxWidth: '800px', margin: 0 }}>
              Find the answers to your questions.
            </p>
          </div>
          <div className="grid-col grid-col-4" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <img
              src={headerImage}
              alt="SapMachine bubble logo"
              className="hero-header-logo"
              style={{ maxHeight: '120px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <Layout title="Frequently Asked Questions">
      <FAQHeader />
      <div className="grid-container" style={{ paddingTop: '2rem', paddingBottom: 'var(--section-spacing-footer, 84px)' }}>
        <div className="grid-row">
          <div className="grid-col grid-col-12 faq-content">
            <FAQContent />
          </div>
        </div>
      </div>
    </Layout>
  );
}
