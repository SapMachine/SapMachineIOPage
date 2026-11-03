// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Card,
  Text,
  CheckBox,
  Icon,
  Link,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/navigation-right-arrow.js";
import "@ui5/webcomponents-icons/dist/slim-arrow-up.js";
import "@ui5/webcomponents-icons/dist/slim-arrow-down.js";

// Hero Header Component
function JMCHeader() {
  const defaultHeaderImage = useBaseUrl('/img/logos/logo-bubble.png');
  const christmasHeaderImage = useBaseUrl('/img/logos/logo-xmas-bubble.png');

  // automatically changes the header image to the x-mas one once it hits december
  const headerImage = new Date().getMonth() === 11 ? christmasHeaderImage : defaultHeaderImage;

  return (
    <div className="hero-header">
      <div className="grid-container">
        <div className="grid-row" style={{ alignItems: 'center' }}>
          <div className="grid-col grid-col-8">
            <h1 className="hero-heading" style={{ color: 'var(--sap-white)', margin: '0 0 24px 0' }}>
              Download JMC
            </h1>
            <p className="hero-paragraph" style={{ color: 'var(--sap-white)', maxWidth: "800px", margin: 0 }}>
              Get JDK Mission Control (JMC) - a powerful profiling and diagnostics tool suite for the JVM.
            </p>
          </div>
          <div className="grid-col grid-col-4" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <img
              src={headerImage}
              alt="SapMachine logo"
              className="hero-header-logo"
              style={{ maxHeight: '120px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Section Component
function FilterSection({ title, children, defaultExpanded = true, noBorder = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        borderBottom: noBorder ? "none" : "1.5px solid #E5E5E5",
        paddingBottom: "16px",
        marginBottom: "16px",
      }}
    >
      <div
        className="download-filter-section-title"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: expanded ? "12px" : "0",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="heading-xxxs" style={{ lineHeight: "20px" }}>
          {title}
        </span>
        <Icon
          name={expanded ? "slim-arrow-up" : "slim-arrow-down"}
          style={{ color: "#0070F2" }}
        />
      </div>
      {expanded && children}
    </div>
  );
}

// OS Icon Component
function OsIcon({ osType, baseUrl }) {
  const logoMap = {
    macos: `${baseUrl}img/logos/Apple-Logo.png`,
    windows: `${baseUrl}img/logos/Windows-Logo.png`,
    linux: `${baseUrl}img/logos/Linux-Logo.png`,
  };

  const logo = logoMap[osType];
  if (!logo) return null;

  return (
    <img
      src={logo}
      alt={`${osType} logo`}
      style={{ width: "48px", height: "48px", objectFit: "contain" }}
    />
  );
}

// Get OS type from key
function getOsType(osKey) {
  if (osKey.startsWith("macos")) return "macos";
  if (osKey.startsWith("windows")) return "windows";
  if (osKey.startsWith("linux")) return "linux";
  return "linux";
}

// Get OS display name
function getOsDisplayName(osKey) {
  if (osKey.startsWith("macos")) return "macOS";
  if (osKey.startsWith("windows")) return "Windows";
  if (osKey.startsWith("linux")) return "Linux";
  return osKey;
}

// Get architecture from osKey
function getArchitecture(osKey) {
  if (osKey.includes("aarch64")) return "aarch64";
  if (osKey.includes("x64") || osKey.includes("x86_64")) return "x64";
  return "";
}

// Download Progress View Component
function DownloadProgressView({ downloadUrl, productName, docsUrl, onRetry }) {
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);

  useEffect(() => {
    // Trigger browser download immediately
    if (!downloadTriggered && downloadUrl) {
      setDownloadTriggered(true);
      
      // Use a hidden link to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // After 5 seconds, stop animation and fill progress bar
      setTimeout(() => {
        setProgressComplete(true);
      }, 5000);
    }
  }, [downloadUrl, downloadTriggered]);

  // Extract filename from URL for display
  const getFilename = () => {
    const urlParts = downloadUrl.split('/');
    return urlParts[urlParts.length - 1] || 'file';
  };

  return (
    <div className="grid-container" style={{ paddingTop: "var(--section-spacing-hero, 84px)", paddingBottom: "var(--section-spacing-footer, 84px)" }}>
      <div className="grid-row">
        <div className="grid-col grid-col-12">
          {/* Download Started Section */}
          <div style={{ marginBottom: "48px" }}>
            <h2 className="section-heading" style={{ margin: "0 0 16px 0" }}>
              Download started!
            </h2>
            
            {/* Progress indicator */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "var(--sap-grey2, #D5DADD)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Progress bar - animated initially, then full blue after 5 seconds */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: progressComplete ? "100%" : "30%",
                    backgroundColor: "var(--sap-blue7, #0070F2)",
                    borderRadius: "4px",
                    animation: progressComplete ? "none" : "indeterminate 1.5s infinite ease-in-out",
                    transition: progressComplete ? "width 0.3s ease-out" : "none",
                  }}
                />
              </div>
            </div>

            {/* Download Info Text - body-s with grey9 color */}
            <p className="body-s" style={{ margin: 0 }}>
              Your download of {productName} should begin automatically. If the download does not start within a few seconds, please{" "}
              <a
                href={downloadUrl}
                onClick={(e) => {
                  e.preventDefault();
                  onRetry();
                }}
                style={{ color: "var(--sap-blue7, #0070F2)", textDecoration: "underline", cursor: "pointer" }}
              >
                start the download manually
              </a>{" "}
              or{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Navigate to checksum page
                }}
                style={{ color: "var(--sap-blue7, #0070F2)", textDecoration: "underline", cursor: "pointer" }}
              >
                verify the download
              </a>.
            </p>
            
            {/* Filename display - body-s inherits grey9 from class */}
            <p className="body-s" style={{ margin: "12px 0 0 0" }}>
              File: {getFilename()}
            </p>
          </div>

          {/* Separator - uses section spacing for responsive margins */}
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "var(--sap-grey3, #D5DADD)",
              marginTop: "var(--section-spacing-block, 56px)",
              marginBottom: "var(--section-spacing-block, 56px)",
            }}
          />

          {/* Further Information Section */}
          <div>
            <h2 className="section-heading" style={{ margin: "0 0 16px 0" }}>
              Further information
            </h2>
            <p className="body-s" style={{ margin: "0 0 24px 0" }}>
              Need help with the setup of {productName}? For more details on usage and configuration, please take a look at our Documentation.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href={docsUrl}
                style={{
                  display: "inline-flex",
                  padding: "10px 20px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor: "var(--sap-blue7, #0070F2)",
                  color: "var(--sap-white, #FFF)",
                  fontFamily: '"72 Brand", "72", "72full", Arial, Helvetica, sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  cursor: "pointer",
                  border: "1px solid var(--sap-blue7, #0070F2)",
                }}
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS animation for indeterminate progress bar */}
      <style>{`
        @keyframes indeterminate {
          0% {
            left: -30%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Download Card Component for JMC
function JMCDownloadCard({ release, baseUrl, onDownloadClick }) {
  const { tag, majorInfo, osType, installers } = release;
  const [selectedInstallerIdx, setSelectedInstallerIdx] = useState(0);

  // Format release name (e.g., "JMC 9")
  const releaseName = majorInfo.label;

  // Get the currently selected installer
  const selectedInstaller = installers[selectedInstallerIdx] || installers[0];

  // Get display name for OS
  const osDisplayName = getOsDisplayName(osType);

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (onDownloadClick && selectedInstaller?.url) {
      // Include OS name in product name: "JMC 9 for macOS"
      onDownloadClick(selectedInstaller.url, `${releaseName} for ${osDisplayName}`);
    }
  };

  return (
    <div className="download-card-wrapper">
      <Card style={{ marginBottom: "0" }}>
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* OS Icon */}
          <div style={{ marginBottom: "16px" }}>
            <OsIcon osType={osType} baseUrl={baseUrl} />
          </div>

          {/* Release Name */}
          <h3 className="heading-xxxs" style={{ margin: "0 0 16px 0", fontWeight: 600 }}>
            {releaseName}
          </h3>

          {/* Version */}
          <div style={{ marginBottom: "12px" }} className="body-s">
            <span style={{ color: "var(--sap-grey6)", marginRight: "12px" }}>
              Version:
            </span>
            <span>{tag}</span>
          </div>

          {/* Installer Tags - Selectable */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="body-s" style={{ color: "var(--sap-grey6)" }}>
                Architecture:
              </span>
              {installers.map((installer, idx) => {
                const isSelected = idx === selectedInstallerIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedInstallerIdx(idx)}
                    style={{
                      display: "inline-flex",
                      padding: "2px 8px",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "6px",
                      border: isSelected
                        ? "1.5px solid #0070F2"
                        : "1.5px solid #A9B4BE",
                      backgroundColor: "#FFF",
                      fontSize: "14px",
                      color: isSelected ? "#0070F2" : "#354A5F",
                      textDecoration: "none",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    {installer.arch}
                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "2px",
                          backgroundColor: "#0070F2",
                          borderRadius: "0 0 4px 4px",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacer to push tags and download to bottom */}
          <div style={{ flexGrow: 1 }} />

          {/* Tags Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            {/* Tag 1: Release type */}
            <span
              style={{
                display: "flex",
                padding: "2px 8px",
                alignItems: "center",
                gap: "4px",
                borderRadius: "6px",
                border: "1px solid var(--sap-grey1, #F5F6F7)",
                backgroundColor: "var(--sap-grey1, #F5F6F7)",
                fontFamily:
                  '"72 Brand", "72", "72full", Arial, Helvetica, sans-serif',
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "18px",
                color: "var(--sap-grey7, #475E75)",
              }}
            >
              {majorInfo.ea ? "Pre-Release" : "General Availability"}
            </span>
            {/* Tag 2: Software system / OS */}
            <span
              style={{
                display: "flex",
                padding: "2px 8px",
                alignItems: "center",
                gap: "4px",
                borderRadius: "6px",
                border: "1px solid var(--sap-grey1, #F5F6F7)",
                backgroundColor: "var(--sap-grey1, #F5F6F7)",
                fontFamily:
                  '"72 Brand", "72", "72full", Arial, Helvetica, sans-serif',
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "18px",
                color: "var(--sap-grey7, #475E75)",
              }}
            >
              {getOsDisplayName(osType)}
            </span>
          </div>

          {/* Download Link */}
          <a
            href={selectedInstaller?.url || "#"}
            onClick={handleDownloadClick}
            className="body-s"
            style={{
              color: "var(--sap-blue7, #0070F2)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
          >
            Download{" "}
            <Icon
              name="navigation-right-arrow"
              style={{ fontSize: "14px", color: "var(--sap-blue7, #0070F2)" }}
            />
          </a>
        </div>
      </Card>
    </div>
  );
}

export default function JMCDownload() {
  const baseUrl = useBaseUrl('/');
  const docsUrl = useBaseUrl('/docs');
  const [jmcData, setJmcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedReleases, setProcessedReleases] = useState([]);

  // Download progress state
  const [downloadInfo, setDownloadInfo] = useState(null); // { url, productName }

  // Handle browser back button when download progress is shown
  useEffect(() => {
    const handlePopState = () => {
      setDownloadInfo(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [filters, setFilters] = useState({
    windows: false,
    macOS: false,
    linux: false,
    ga: true,
    preRelease: false,
  });

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch JMC releases
        const jmcResponse = await fetch(`${baseUrl}assets/data/jmc_releases.json`);
        if (!jmcResponse.ok) throw new Error("Failed to fetch JMC releases");
        const jmc = await jmcResponse.json();
        setJmcData(jmc);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [baseUrl]);

  // Process releases when data changes or filters change
  useEffect(() => {
    if (!jmcData) return;

    const processed = [];

    // Check if any filter is selected in each category
    const anyOsSelected = filters.windows || filters.macOS || filters.linux;
    const anyReleaseSelected = filters.ga || filters.preRelease;

    // Iterate through majors
    jmcData.majors.forEach((major) => {
      // Apply release type filters
      const isEa = major.ea;
      const isGa = !major.ea;

      if (anyReleaseSelected) {
        if (!((isGa && filters.ga) || (isEa && filters.preRelease))) {
          return;
        }
      }

      const assets = jmcData.assets[major.id];
      if (!assets || !assets.releases || assets.releases.length === 0) return;

      // Get the latest release for this major
      const latestRelease = assets.releases[0];

      // Group by OS type
      const osPlatforms = {};

      Object.entries(latestRelease.urls).forEach(([osKey, url]) => {
        const osType = getOsType(osKey);

        // Apply OS filter
        if (anyOsSelected) {
          if (osType === "macos" && !filters.macOS) return;
          if (osType === "windows" && !filters.windows) return;
          if (osType === "linux" && !filters.linux) return;
        }

        if (!osPlatforms[osType]) {
          osPlatforms[osType] = {
            downloads: [],
          };
        }

        const arch = getArchitecture(osKey);

        osPlatforms[osType].downloads.push({
          arch,
          url,
          osKey,
        });
      });

      // Create cards for each OS type that has downloads
      Object.entries(osPlatforms).forEach(([osType, data]) => {
        if (data.downloads.length > 0) {
          processed.push({
            tag: latestRelease.tag,
            majorInfo: major,
            osType,
            installers: data.downloads,
          });
        }
      });
    });

    setProcessedReleases(processed);
  }, [jmcData, filters]);

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const clearAllFilters = () => {
    setFilters({
      windows: false,
      macOS: false,
      linux: false,
      ga: false,
      preRelease: false,
    });
  };

  // Handle download click - shows progress view
  const handleDownloadClick = (url, productName) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ downloadProgress: true }, '');
    setDownloadInfo({ url, productName });
  };

  // Handle retry download
  const handleRetryDownload = () => {
    if (downloadInfo?.url) {
      const link = document.createElement('a');
      link.href = downloadInfo.url;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // If download is in progress, show the progress view
  if (downloadInfo) {
    return (
      <Layout
        title="Download JMC"
        description="Download JDK Mission Control - A powerful profiling and diagnostics tool for the JVM"
      >
        <JMCHeader />
        <DownloadProgressView
          downloadUrl={downloadInfo.url}
          productName={downloadInfo.productName}
          docsUrl={docsUrl}
          onRetry={handleRetryDownload}
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Download JMC"
      description="Download JDK Mission Control - A powerful profiling and diagnostics tool for the JVM"
    >
      <JMCHeader />

      <div
        className="grid-container"
        style={{ paddingTop: "var(--section-spacing-hero, 84px)", paddingBottom: "var(--section-spacing-footer, 84px)" }}
      >
        <div className="grid-row">
          {/* Filters Sidebar */}
          <div className="grid-col grid-col-3">
            <div
              className="download-filters-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 className="heading-xs" style={{ margin: 0, fontWeight: 400 }}>
                Filters
              </h2>
              <a
                href="#"
                className="download-clear-all"
                onClick={(e) => {
                  e.preventDefault();
                  clearAllFilters();
                }}
                style={{
                  color: "#0070F2",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Clear all
              </a>
            </div>

            <FilterSection title="Operating System">
              <div className="download-filter-os-grid">
                <CheckBox text="Windows" checked={filters.windows} onChange={() => handleFilterChange("windows")} className="filter-checkbox" />
                <CheckBox text="macOS" checked={filters.macOS} onChange={() => handleFilterChange("macOS")} className="filter-checkbox" />
                <CheckBox text="Linux" checked={filters.linux} onChange={() => handleFilterChange("linux")} className="filter-checkbox" />
              </div>
            </FilterSection>

            <FilterSection title="Release" noBorder>
              <div className="download-filter-release-grid">
                <div className="download-filter-release-col">
                  <CheckBox text="General Availability" checked={filters.ga} onChange={() => handleFilterChange("ga")} className="filter-checkbox" />
                </div>
              </div>
            </FilterSection>
          </div>

          {/* Results Section */}
          <div className="grid-col grid-col-9">
            <div
              className="download-results-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 className="heading-xs" style={{ margin: 0, fontWeight: 400 }}>
                Results
              </h2>
              <Text style={{ color: "#6A6D70", fontSize: "14px" }}>
                {loading ? "Loading..." : `${processedReleases.length} results`}
              </Text>
            </div>

            {error && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#FFEBEE",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                <Text style={{ color: "#C62828" }}>
                  Error loading data: {error}
                </Text>
              </div>
            )}

            {loading && (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Text>Loading JMC releases...</Text>
              </div>
            )}

            {!loading && !error && processedReleases.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Text>
                  No releases match your current filters. Try adjusting your
                  selection.
                </Text>
              </div>
            )}

            {!loading && !error && (
              <div
                className="download-cards-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "24px",
                  alignItems: "stretch",
                }}
              >
                {processedReleases.map((release, idx) => (
                  <JMCDownloadCard
                    key={`${release.tag}-${release.osType}-${idx}`}
                    release={release}
                    baseUrl={baseUrl}
                    onDownloadClick={handleDownloadClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}