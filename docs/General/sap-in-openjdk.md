---
title: "SAP's Engagement in the OpenJDK project"
sidebar_position: 12
slug: /sap-in-openjdk
---

{/* Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. */}

# SAP's Engagement in the OpenJDK Project

SAP is actively involved in the OpenJDK project, contributing to its development and maintaining, through [SapMachine](https://github.com/SAP/SapMachine), a downstream fork tailored to the needs of SAP customers and partners. This page highlights SAP's significant contributions and its involvement in the OpenJDK community, providing a comprehensive overview of their engagement and the benefits it brings to the Java ecosystem.

## Membership and Expert Groups

SAP has been a key player in the Java ecosystem for many years:

- **JCP Executive Committee Member**: SAP's membership in the Java Community Process (JCP) Executive Committee, held since 2001, ensures that SAP has a significant influence on the direction and standards of the Java platform. This benefits both SAP and the broader Java community.
- **Java SE Expert Groups**: SAP has been part of the Java SE Expert Groups since Java SE 9. These expert groups review the Java Specification Requests (JSR) which define the standard for Java releases. This ongoing involvement allows SAP to shape the future of Java SE and ensure that it meets the needs of enterprise applications, both now and in the future. A comprehensive list of all JSRs is available on the [JCP JSR website](https://www.jcp.org/en/jsr/all#:~:text=379).

## Contributions to OpenJDK

SAP is one of the largest external contributors to the OpenJDK project. Some notable examples include:

- **OpenJDK updates**: SAP is Lead Maintainer for [OpenJDK 25 updates](https://wiki.openjdk.org/display/JDKUpdates/JDK+25u) and [OpenJDK 17 updates](https://wiki.openjdk.org/display/JDKUpdates/JDK+17u), and Maintainer for [OpenJDK 21 updates](https://wiki.openjdk.org/display/JDKUpdates/JDK+21u), ensuring these release lines remain stable, secure, and reliable.
- **Backports in OpenJDK**: SAP invests significant effort in backporting fixes and improvements to OpenJDK update releases. This is crucial for supporting Java-related SAP products that cannot run on the latest Java releases due to the constraints of enterprise applications.
- **Among the biggest external contributors** to the OpenJDK project. An illustration is given in the "JDK 25 Fix Ratio" section of [Oracle's Java 25 release post](https://blogs.oracle.com/java/post/the-arrival-of-java-25).
- **Helpful NullPointerExceptions**: Introduced Helpful NullPointerExceptions ([JEP 358](https://openjdk.org/jeps/358)), which enhances null pointer exceptions by providing more detailed information, including the variable name and type. This improvement helps developers identify and fix null pointer exceptions more quickly and accurately.
- **Elastic Metaspace**: Introduced the Elastic Metaspace ([JEP 387](https://openjdk.org/jeps/387)), which improves the efficiency of metaspace memory usage by the JVM and hence helps reducing memory footprint.
- **JFR CPU-Time Profiling**: Added JFR CPU-Time Profiling ([JEP 509](https://openjdk.org/jeps/509)), which brings CPU based profiling capabilities to the JFR feature of the JDK.
- **PowerPC/AIX Port**: SAP brought the PowerPC/AIX port ([JEP 175](https://openjdk.org/jeps/175)) to the OpenJDK and is leading the [PowerPC/AIX porting project](https://openjdk.org/projects/ppc-aix-port/). With that, OpenJDK can be used on IBM's PowerPC systems and its supported Operating Systems AIX and Linux.
- **S390 port**: SAP contributed the S390 port ([JEP 294](https://openjdk.org/jeps/294)) that brought support of Linux on the IBM S390 architecture to the OpenJDK.

SAP's contributions ensure that SAP's expertise and dedication benefit both the OpenJDK community and SAP's customers, providing stable and reliable distributions of SapMachine and OpenJDK.

## Innovations and Tools

SAP has introduced several innovative features and tools to be used by developers and support engineers in the Java community:

- [JFR Event Collection](https://sap.github.io/jfrevents/): Information on all Java Flight Recorder (JFR) events for a specific Java Development Kit (JDK). This tool is invaluable for performance tuning and debugging.
- [Java JFR Profiler Plugin](https://plugins.jetbrains.com/plugin/20937-java-jfr-profiler): A profiler plugin for the IDE IntelliJ from Jetbrains. This plugin enhances the development experience by providing detailed profiling information.
- [CF Java CLI Plugin](https://github.com/SAP/cf-cli-java-plugin): This extension plugin for the Command Line Interface (CLI) of Cloud Foundry (CF) is to easily profile Java applications and get heap and thread-dumps in Cloud Foundry. This plugin is particularly useful for developers working in cloud environments, like in SAP Business Technology Platform (BTP).
- [AP-Loader](https://github.com/jvm-profiling-tools/ap-loader): Provides async-Profiler in a single cross-platform JAR. This tool simplifies the process of profiling Java applications.

## Conclusion

SAP's extensive contributions and leadership roles in the OpenJDK project benefit both the broader Java community and SAP's customers, making the Java platform more robust, secure, and feature-rich.
