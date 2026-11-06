---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
---

## Frequently Asked Questions

1. [What is SapMachine?](#what-is-sapmachine)
2. [What is the release roadmap and maintenance schedule of SapMachine?](#what-is-the-release-roadmap-and-maintenance-schedule-of-sapmachine)
3. [What is the process and schedule for security updates of SapMachine?](#what-is-the-process-and-schedule-for-security-updates-of-sapmachine)
4. [What platforms are supported by SapMachine?](#what-platforms-are-supported-by-sapmachine)
5. [Are SapMachine builds verified by the Java Compatibility Kit (JCK)?](#are-sapmachine-builds-verified-by-the-java-compatibility-kit-jck)
6. [What are the differences between SapMachine and the OpenJDK?](#what-are-the-differences-between-sapmachine-and-the-openjdk)
7. [Can SAP contribute patches/fixes to the OpenJDK?](#can-sap-contribute-patches-and-fixes-to-the-openjdk)
8. [Where can I find SapMachine Debug Symbols?](#where-can-i-find-sapmachine-debug-symbols)
9. [Where can I find the SapMachine Git Repository?](#where-can-i-find-the-sapmachine-git-repository)
10. [How can I report issues?](#how-can-i-report-issues)

## What is SapMachine?

SapMachine is a build of the OpenJDK, maintained and supported by SAP and enhanced with enterprise features. It provides a free and open-source implementation of the Java Platform, Standard Edition (Java SE).

## What is the release roadmap and maintenance schedule of SapMachine?

New SapMachine major releases appear twice a year, following the OpenJDK release train. The detailed schedule can be found at <a href="https://openjdk.org/projects/jdk/" target="_blank">OpenJDK's JDK Project</a>. While each major release is usually only supported for half a year until the next major release is out, every other year one major release is designated as Long-Term Support (LTS) and will be maintained for a longer period. For supported major versions, there will be an update releases every quarter of a year, as documented in <a href="https://openjdk.org/projects/jdk-updates/" target="_blank">OpenJDK's JDK Update Project</a>. How this maps to SapMachine can be seen on the [Maintenance and Support](../docs/maintenance-and-support) page.

## What is the process and schedule for security updates of SapMachine?

SAP is member of the <a href="https://openjdk.org/groups/vulnerability/" target="_blank">OpenJDK Vulnerability Group</a>, a secure, private forum in which trusted members of the OpenJDK Community receive reports of vulnerabilities in OpenJDK code bases, review them, collaborate on fixing them, coordinate the release of such fixes, and share the security fixes before release. Therewith SapMachine can build and test upcoming `critical patch updates` before these are made public. SAP internal colleagues can take part in these tests to ensure that their products are secure on day one after critical patch updates will be released to everyone.

Security updates, also known as Critical Patch Updates (CPU), are released every quarter of a year for all active versions of SapMachine. The release is scheduled for the Tuesday closest to the 17th day of January, April, July and October.

## What platforms are supported by SapMachine?

The list of current supported platforms is available on the [Maintenance and Support](../docs/maintenance-and-support) page.

## Are SapMachine builds verified by the Java Compatibility Kit (JCK)?

Information can be found on the [Certification and Java Compatibility](../docs/certification-and-java-compatibility) page.

## What are the differences between SapMachine and the OpenJDK?

All known differences are detailed in the [Features of SapMachine](../docs/features) page.

## Can SAP contribute patches and fixes to the OpenJDK?

Yes. The SapMachine team is actively contributing to the OpenJDK. Team individuals are holding different project and group related roles, such as Project Lead, Reviewer or Committer. We contribute new features, but also provide bug fixes and are maintainers of the JDK updates projects.

## Where can I find SapMachine Debug Symbols?

SapMachine debug symbols are available as separate binaries in the release section on GitHub (e.g. for `SapMachine 25.0.4` on Linux-x64 the correct archive would be <a href="https://github.com/SAP/SapMachine/releases/download/sapmachine-25.0.4/sapmachine-jdk-25.0.4_linux-x64_bin-symbols.tar.gz" target="_blank">sapmachine-jdk-25.0.4_linux-x64_bin-symbols.tar.gz</a>).
Download the archive matching your architecture, extract it and copy the content of the `bin` and `lib` folder to the same directory in the root directory of your SapMachine installation.

## Where can I find the SapMachine Git Repository?

The SapMachine source code and project files are hosted on GitHub at [github.com/SAP/SapMachine](https://github.com/SAP/SapMachine).

## How can I report issues?

To ensure your request is handled efficiently, please determine whether the issue is specific to SapMachine or related to the upstream OpenJDK project:

* **For SapMachine-specific issues:** If the issue is related to SapMachine builds, packaging, release delivery, or SAP-specific platform support, please open an issue in the [SapMachine GitHub repository](https://github.com/SAP/SapMachine/issues).
* **For general OpenJDK issues:** If the issue is related to general Java language features, core libraries, or behavior present in all OpenJDK distributions, it should be reported directly to the upstream project. You can find the official OpenJDK source code and community guidelines at [github.com/openjdk/jdk](https://github.com/openjdk/jdk).
