// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home() {
  const [selectedTab, setSelectedTab] = useState('java-code');

  const benefitTabs = ['supported-by-sap', 'no-cost', 'all-platforms', 'enterprise-ready', 'maintenance'];
  const [selectedBenefitTab, setSelectedBenefitTab] = useState(null);
  const benefitIntervalRef = useRef(null);
  const benefitSectionRef = useRef(null);

  const startBenefitInterval = () => {
    if (benefitIntervalRef.current) clearInterval(benefitIntervalRef.current);
    benefitIntervalRef.current = setInterval(() => {
      setSelectedBenefitTab(prev => {
        const idx = benefitTabs.indexOf(prev);
        return benefitTabs[(idx + 1) % benefitTabs.length];
      });
    }, 7500);
  };

  useEffect(() => {
    const section = benefitSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setSelectedBenefitTab('supported-by-sap');
          startBenefitInterval();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      clearInterval(benefitIntervalRef.current);
    };
  }, []);

  const handleBenefitTabClick = (tab) => {
    setSelectedBenefitTab(tab);
    startBenefitInterval();
  };

  const defaultBannerImage = useBaseUrl('/img/homepage/banner_sealife.svg');
  const christmasBannerImage = useBaseUrl('/img/homepage/banner_sealife_xmas.svg');

  //automatically changes the homepage banner to the x-mas themed one once it hits december
  const bannerImage = new Date().getMonth() === 11 ? christmasBannerImage : defaultBannerImage;  

  // Pre-compute all image URLs at the top level (hooks must be called unconditionally)
  const supportedBySapImage = useBaseUrl('/img/homepage/301231_Heart-Diversity-Inclusion_R.png');
  const noCostImage = useBaseUrl('/img/homepage/300922_Money-Purchase_R.png');
  const allPlatformsImage = useBaseUrl('/img/homepage/305147_Code_R.png');
  const enterpriseReadyImage = useBaseUrl('/img/homepage/302222_Streamline_R.png');
  const maintenanceImage = useBaseUrl('/img/homepage/301705_Tools_R.png');

  return (
    <Layout>
      {/* Main Content - target for skip-to-main-content link */}
      <main id="main-content">
      {/* Hero Section with Banner Background */}
      <section
        className="hero-header"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#001CA2',
        }}
      >
        <div className="grid-container">
          <div className="grid-row">
            <div className="grid-col grid-col-12">
              {/* <p className="eyebrow-text">INTRO TEXT</p> */}
              <h1 className="hero-heading" style={{ maxWidth: '800px', color: 'var(--sap-white)', margin: '0 0 24px 0' }}>
                SapMachine
              </h1>
              <p className="hero-paragraph" style={{ maxWidth: '800px', marginBottom: '3rem', color: 'var(--sap-white)' }}>
                SapMachine is a distribution of the OpenJDK maintained by SAP. It is designed to be free, cross-platform, production-ready, and Java SE certified. This distribution serves as the default Java Runtime for SAP’s numerous applications and services.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={useBaseUrl('/download')} className="btn-base btn-primary">
                  Download
                </a>
                <a href={useBaseUrl('/docs')} className="btn-base btn-secondary">
                  Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SapMachine - Title Section (Content Block 1) */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: 'var(--section-spacing-hero, 84px)',
        }}
      >
        <div className="grid-container">
          <div className="grid-row">
            <div className="grid-col grid-col-12">
              {/* Section Heading - default color is Black */}
              <h2 className="section-heading" style={{ margin: '0 0 16px 0' }}>
                Why choose SapMachine?
              </h2> 

              {/* Body text - Body/S (16px) */}
              <p className="body-copy" style={{ margin: '0 0 1rem 0', maxWidth: '1280px' }}>
                SapMachine supports all major operating systems. It comes with long-term support releases that include bug fixes and performance updates.
              </p>
              <p className="body-copy" style={{ margin: '0 0 1rem 0', maxWidth: '1280px' }}>
                Our goal is to keep SapMachine as close to OpenJDK as possible, only adding additional features when absolutely necessary.
              </p>
              <p className="body-copy" style={{ margin: '0', maxWidth: '1280px' }}>
                Our team's many contributions to the OpenJDK and the ecosystem include the PowerPC/AIX support, elastic Metaspace, helpful NullPointerExceptions, a website for JFR events and more.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* Benefits of SapMachine - Title Section (Content Block 2) */}
      <section
        ref={benefitSectionRef}
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: 'var(--section-spacing-block, 56px)',
          paddingBottom: 'var(--section-spacing-footer, 84px)',
        }}
      >
        <div className="grid-container">
          <div className="grid-row">
            <div className="grid-col grid-col-12">
              {/* Section Heading - default color is Black */}
              <h2 className="section-heading" style={{ margin: '0 0 32px 0' }}>
                Benefits of SapMachine
              </h2>
            </div>
          </div>

          {/* Vertical Tab Navigation - 6 columns text, 6 columns image */}
          <div className="grid-row">
            {/* Left side - Vertical tabs */}
            <div className="grid-col grid-col-6">
              <div className="vertical-tab-navigation">
                {/* Tab: Supported by SAP */}
                <button
                  className={`vertical-tab-item ${selectedBenefitTab === 'supported-by-sap' ? 'vertical-tab-item-active' : ''}`}
                  onClick={() => handleBenefitTabClick('supported-by-sap')}
                >
                  <span className="vertical-tab-title">Supported by SAP</span>
                  <span className="vertical-tab-description">
                    SapMachine is developed and maintained by SAP, ensuring enterprise-grade quality, security updates, and long-term support for mission-critical applications.
                  </span>
                </button>

                {/* Tab: No Cost */}
                <button
                  className={`vertical-tab-item ${selectedBenefitTab === 'no-cost' ? 'vertical-tab-item-active' : ''}`}
                  onClick={() => handleBenefitTabClick('no-cost')}
                >
                  <span className="vertical-tab-title">No Cost</span>
                  <span className="vertical-tab-description">
                    SapMachine is completely free to use in development and production environments. No licensing fees, no subscriptions required.
                  </span>
                </button>

                {/* Tab: All Platforms */}
                <button
                  className={`vertical-tab-item ${selectedBenefitTab === 'all-platforms' ? 'vertical-tab-item-active' : ''}`}
                  onClick={() => handleBenefitTabClick('all-platforms')}
                >
                  <span className="vertical-tab-title">All Platforms</span>
                  <span className="vertical-tab-description">
                    macOS, Windows, Linux and AIX. SapMachine runs on all major operating systems and architectures, enabling true cross-platform development.
                  </span>
                </button>

                {/* Tab: Enterprise Ready */}
                <button
                  className={`vertical-tab-item ${selectedBenefitTab === 'enterprise-ready' ? 'vertical-tab-item-active' : ''}`}
                  onClick={() => handleBenefitTabClick('enterprise-ready')}
                >
                  <span className="vertical-tab-title">Enterprise Ready</span>
                  <span className="vertical-tab-description">
                    Battle-tested in SAP's own production environments, SapMachine is certified for Java SE compatibility and designed for enterprise-scale workloads.
                  </span>
                </button>

                {/* Tab: Maintenance */}
                <button
                  className={`vertical-tab-item ${selectedBenefitTab === 'maintenance' ? 'vertical-tab-item-active' : ''}`}
                  onClick={() => handleBenefitTabClick('maintenance')}
                >
                  <span className="vertical-tab-title">Maintenance</span>
                  <span className="vertical-tab-description">
                    Regular updates with security patches, bug fixes, and performance improvements. Long-term support releases receive updates for years.
                  </span>
                </button>
              </div>
            </div>

            {/* Right side - Image/graphic area */}
            <div className="grid-col grid-col-6">
              <div
                key={selectedBenefitTab}
                className="benefit-image-wrapper"
                style={{
                  width: '100%', 
                  aspectRatio: '1 / 1', 
                  backgroundColor: 'var(--sap-grey1, #F5F6F7)', 
                  borderRadius: '8px',
                  maxHeight: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Padding only for pictograms, not for full images
                  padding: (selectedBenefitTab === 'no-cost' || selectedBenefitTab === 'maintenance') ? '48px' : '0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }} 
              >
                {/* Supported by SAP - full image, positioned to the right */}
                {selectedBenefitTab === 'supported-by-sap' && (
                  <img 
                    src={supportedBySapImage}
                    alt="Supported by SAP pictogram"
                    style={{
                      height: '80%',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {/* Pictogram images based on selected tab */}
                {selectedBenefitTab === 'no-cost' && (
                  <img 
                    src={noCostImage}
                    alt="No cost pictogram"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {selectedBenefitTab === 'all-platforms' && (
                  <img 
                    src={allPlatformsImage}
                    alt="All Platforms pictogram"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {selectedBenefitTab === 'enterprise-ready' && (
                  <img 
                    src={enterpriseReadyImage}
                    alt="Enterprise Ready pictogram"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {selectedBenefitTab === 'maintenance' && (
                  <img 
                    src={maintenanceImage}
                    alt="Maintenance pictogram"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is an OpenJDK - Title Section (Content Block 3) */}
      {/* <section
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: 'var(--section-spacing-block, 56px)',
        }}
      >
        <div className="grid-container">
          <div className="grid-row">
            <div className="grid-col grid-col-12">
              <h2 className="section-heading" style={{ margin: '0 0 16px 0' }}>
                What is an OpenJDK?
              </h2>
              <p className="section-subheading" style={{ margin: '0', maxWidth: '1280px' }}>
                Text explaining what an OpenJDK is and where it is used, should not be that long. Like maybe two to three rows, it is better to keep it short.
                Otherwise users are very much declined to skip ahead. Lorem ipsum dolor sit amet, i forgot how it continues.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* ============================================
          TAB NAVIGATION SECTION - COMMENTED OUT
          To re-enable: Remove the opening {/* and closing *}/ markers below
          ============================================ */}
      {/*
      <section
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: 'var(--section-spacing-block, 56px)',
          paddingBottom: 'var(--section-spacing-footer, 84px)',
        }}
      >
        <div className="grid-container">
          <div className="grid-row">
            <div className="grid-col grid-col-12">
              <div className="tab-navigation">
                <button
                  className={`tab-item ${selectedTab === 'java-code' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('java-code')}
                >
                  <span className={`tab-item-text ${selectedTab === 'java-code' ? 'tab-item-text-active' : ''}`}>Java Code</span>
                </button>
                <button
                  className={`tab-item ${selectedTab === 'jvm' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('jvm')}
                >
                  <span className={`tab-item-text ${selectedTab === 'jvm' ? 'tab-item-text-active' : ''}`}>JVM</span>
                </button>
                <button
                  className={`tab-item ${selectedTab === 'jdk-jre' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('jdk-jre')}
                >
                  <span className={`tab-item-text ${selectedTab === 'jdk-jre' ? 'tab-item-text-active' : ''}`}>JDK/JRE</span>
                </button>
                <button
                  className={`tab-item ${selectedTab === 'sapmachine' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('sapmachine')}
                >
                  <span className={`tab-item-text ${selectedTab === 'sapmachine' ? 'tab-item-text-active' : ''}`}>SapMachine</span>
                </button>
                <button
                  className={`tab-item ${selectedTab === 'jmc' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('jmc')}
                >
                  <span className={`tab-item-text ${selectedTab === 'jmc' ? 'tab-item-text-active' : ''}`}>JMC</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid-row">
            {selectedTab === 'java-code' && (
              <>
                <div className="grid-col grid-col-8">
                  <div style={{ width: '100%', aspectRatio: '848 / 560', backgroundColor: 'var(--sap-blue11, #00144A)', borderRadius: '8px' }} />
                </div>
                <div className="grid-col grid-col-4">
                  <h3 className="small-heading" style={{ margin: '0 0 16px 0' }}>Java Code</h3>
                  <p className="body-copy" style={{ margin: '0' }}>
                    Java code is written in human-readable syntax and compiled into bytecode. Unlike native executables, Java bytecode cannot run directly on your operating system, it requires a JVM to interpret and execute it.
                  </p>
                </div>
              </>
            )}

            {selectedTab === 'jvm' && (
              <>
                <div className="grid-col grid-col-8">
                  <div style={{ width: '100%', aspectRatio: '848 / 560', backgroundColor: 'var(--sap-blue9, #0040B0)', borderRadius: '8px' }} />
                </div>
                <div className="grid-col grid-col-4">
                  <h3 className="small-heading" style={{ margin: '0 0 16px 0' }}>JVM</h3>
                  <p className="body-copy" style={{ margin: '0' }}>
                    The Java Virtual Machine (JVM) is the engine that executes Java bytecode. It provides platform independence and manages memory, security, and performance optimization.
                  </p>
                </div>
              </>
            )}

            {selectedTab === 'jdk-jre' && (
              <>
                <div className="grid-col grid-col-8">
                  <div style={{ width: '100%', aspectRatio: '848 / 560', backgroundColor: 'var(--sap-blue7, #0070F2)', borderRadius: '8px' }} />
                </div>
                <div className="grid-col grid-col-4">
                  <h3 className="small-heading" style={{ margin: '0 0 16px 0' }}>JDK/JRE</h3>
                  <p className="body-copy" style={{ margin: '0' }}>
                    The JDK (Java Development Kit) contains tools for developing Java applications, while the JRE (Java Runtime Environment) provides the runtime needed to execute Java programs.
                  </p>
                </div>
              </>
            )}

            {selectedTab === 'sapmachine' && (
              <>
                <div className="grid-col grid-col-8">
                  <div style={{ width: '100%', aspectRatio: '848 / 560', backgroundColor: 'var(--sap-blue5, #4DB1FF)', borderRadius: '8px' }} />
                </div>
                <div className="grid-col grid-col-4">
                  <h3 className="small-heading" style={{ margin: '0 0 16px 0' }}>SapMachine</h3>
                  <p className="body-copy" style={{ margin: '0' }}>
                    SapMachine is SAPs free, certified OpenJDK distribution. It provides long-term support releases with bug fixes and performance improvements for enterprise applications.
                  </p>
                </div>
              </>
            )}

            {selectedTab === 'jmc' && (
              <>
                <div className="grid-col grid-col-8">
                  <div style={{ width: '100%', aspectRatio: '848 / 560', backgroundColor: 'var(--sap-blue3, #A6E0FF)', borderRadius: '8px' }} />
                </div>
                <div className="grid-col grid-col-4">
                  <h3 className="small-heading" style={{ margin: '0 0 16px 0' }}>JDK Mission Control</h3>
                  <p className="body-copy" style={{ margin: '0' }}>
                    JDK Mission Control (JMC) is a powerful profiling and diagnostics tool for Java applications. It analyzes data from Java Flight Recorder (JFR) to help developers monitor performance, troubleshoot issues, and optimize their applications with minimal overhead.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      */}
      {/* END TAB NAVIGATION SECTION */}
      </main>
    </Layout>
  );
}