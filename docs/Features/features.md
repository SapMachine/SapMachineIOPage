---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "Features of SapMachine"
sidebar_position: 1
slug: /features
redirect_from:
  - /docs/Features
  - /docs/features-of-sapmachine
  - /docs/Features-of-Sapmachine
---

# Features of SapMachine

SapMachine is kept as close as possible to the OpenJDK to make it usable as a drop-in replacement for any OpenJDK build by any vendor. Therefore, features and fixes identified to be required for SAP applications will usually be developed _in_ and contributed _to_ the OpenJDK.

It might happen that something which we deem important for our enterprise customers can not make its way into the OpenJDK. In that case we will accept differences between SapMachine and OpenJDK. But we try to be very cautious and selective with that.

To ensure transparency, this page outlines all SapMachine features that differ from upstream OpenJDK.

## Version numbers

You can identify SapMachine using the `java -version` command (see below). Although the version information of SapMachine and OpenJDK/Oracle JDK are slightly different, the SapMachine version output still fully conforms to the format specified in the <a href="https://openjdk.org/jeps/322" target="_blank">JEP 322: Time-Based Release Versioning</a> and <a href="https://openjdk.org/jeps/223" target="_blank">JEP 223: New Version-String Scheme</a>. SapMachine follows the same version numbering scheme as OpenJDK.

### SapMachine version information

```shell
$ ./sapmachine-25/bin/java -version
openjdk version "25.0.1" 2025-10-21 LTS
OpenJDK Runtime Environment SapMachine (build 25.0.1+8-LTS)
OpenJDK 64-Bit Server VM SapMachine (build 25.0.1+8-LTS, mixed mode, sharing)
```

In addition to the original OpenJDK version output (see below), SapMachine adds an optional part (i.e. `LTS`) to the version number. This optional part (defined as <a href="https://openjdk.org/jeps/322#Version-strings" target="_blank">optional build information</a> in JEP 322) starts with `LTS` for long term support releases. If we will do an additional SapMachine specific release for this version, the fifth element of the
version number will be increased and looks as follows `17.0.3.0.1+0-LTS`. Once we pull and merge the next upstream release, this number will be reset to zero (e.g. `17.0.4+0-LTS`). We are currently not using the build number part of the version string and always set it to `0`.

The version date, as defined in JEP 322, will be set to the date, the SapMachine is generally available (GA).
This date is never before the OpenJDK GA but may be set to a date after the OpenJDK GA.

### OpenJDK version information

```shell
$ ./jdk-25-openjdk/bin/java -version
openjdk version "25.0.1" 2025-10-21
OpenJDK Runtime Environment (build 25.0.1+8)
OpenJDK 64-Bit Server VM (build 25.0.1+8, mixed mode, sharing)
```

## System properties

The following differences in Java system properties exist between SapMachine and OpenJDK:

```diff
-    java.runtime.version = 25.0.1+8
+    java.runtime.version = 25.0.1+8-LTS
-    java.vendor = Oracle Corporation
-    java.vendor.url = https://java.oracle.com/
-    java.vendor.url.bug = https://bugreport.java.com/bugreport/
+    java.vendor = SAP SE
+    java.vendor.url = https://sapmachine.io/
+    java.vendor.url.bug = https://github.com/SAP/SapMachine/issues/new
+    java.vendor.version = SapMachine
-    java.vm.vendor = Oracle Corporation
-    java.vm.version = 25.0.1+8
+    java.vm.vendor = SAP SE
+    java.vm.version = 25.0.1+8-LTS
```

## Behavioral differences

* SapMachine enables extended thread dumps <a href="https://bugs.openjdk.org/browse/JDK-8205604" target="_blank">`-XX:+PrintExtendedThreadInfo`</a>. See also <a href="https://bugs.openjdk.org/browse/JDK-8200720" target="_blank">JDK-8200720</a>.

* SapMachine enables output of additional information in exception messages by setting jdk.includeInExceptions in the [java security configuration file](https://github.com/openjdk/jdk/blob/master/src/java.base/share/conf/security/java.security). SapMachine 11 sets this property to ['hostinfo'](https://github.com/SAP/SapMachine/blob/sapmachine11/src/java.base/share/conf/security/java.security), SapMachine 12 and later set ['hostinfo,jar'](https://github.com/SAP/SapMachine/blob/sapmachine/src/java.base/share/conf/security/java.security). See also <a href="https://bugs.openjdk.org/browse/JDK-8204622" target="_blank">JDK-8204622</a> and <a href="https://bugs.openjdk.org/browse/JDK-8207768" target="_blank">JDK-8207768</a>.

* SapMachine enables <a href="https://bugs.openjdk.org/browse/JDK-8233014" target="_blank">output of code snippets in exception messages</a>.

* SapMachine enables <a href="https://bugs.openjdk.org/browse/JDK-8211846" target="_blank">`-XX:+ExtensiveErrorReports`</a>.

* SapMachine trusts the SAP specific root certificate "SAP Global Root CA", used by the <a href="https://www.pki.co.sap.com/" target="_blank">SAP Global PKI infrastructure</a>.

* SapMachine has a supportability feature called [Vitals](vitals).

* SapMachine prints all flags in hs_err files, not just the default ones. Comments are omitted, though.

* SapMachine enables <a href="https://openjdk.org/jeps/519" target="_blank">JEP 519: Compact Object Headers</a> per default since SapMachine 25 and beyond.

* SapMachine 25.0.2 and later enable <a href="https://github.com/SAP/SapMachine/issues/2137" target="_blank">transparent huge pages `-XX:+UseTransparentHugePages`</a> by default, if these conditions are met:
  * Linux (glibc) on any supported CPU architecture
  * The transparent hugepage file `/sys/kernel/mm/transparent_hugepage/enabled` is set to [madvise] or [always]
  * Garbage collector is SerialGC, ParallelGC, or G1GC
  * Java heap size (-Xmx) is 128 MB or larger

* SapMachine introduces `-XX:GlibcMallocArenas` and optimizes Linux memory management in releases from 2026 onwards, reducing memory footprint and addressing reported performance issues. The switch has been introduced exclusively for Linux (glibc) platforms. It regulates the number of malloc arenas used by the JVM:  
  * `-XX:GlibcMallocArenas=0` Uses the OS default (typically eight times the number of CPUs).
  * `-XX:GlibcMallocArenas=1` Uses one malloc arena (recommended).
  * `-XX:GlibcMallocArenas=2` Allows up to two malloc arenas.
  * `-XX:GlibcMallocArenas=<value>` Allows up to `<value>` malloc arenas, where `<value>` is an integer.

  In SapMachine 25.0.2 and later, the default is set to 1, optimizing memory usage. Since SapMachine 21.0.10 and 17.0.18 onwards, the default remains 0 only for compatibility. For more insights, visit <a href="https://github.com/SAP/SapMachine/issues/2109" target="_blank">GitHub</a>.

* SapMachine reduced the number of CDS archives (*.jsa files shipped with SapMachine) in SapMachine 25 from 4 to 1 and this way reduced the size of the downloaded JDK image of SapMachine significantly. The jsa files contain preloaded JVM data to speed up the VM start by avoiding the need for some initialization operations. More information about CDS, including some info about application specific CDS can be found here: <a href="https://docs.oracle.com/en/java/javase/25/vm/class-data-sharing.html#GUID-7EAA3411-8CF0-4D19-BD05-DF5E1780AA91" target="_blank">docs.oracle.com</a>.

* SapMachine has two additional JFR configurations, especially for GC profiling (<a href="https://github.com/SAP/SapMachine/blob/sapmachine/src/jdk.jfr/share/conf/jfr/gc.jfc" target="_blank">gc.jfc</a> and <a href="https://github.com/SAP/SapMachine/blob/sapmachine/src/jdk.jfr/share/conf/jfr/gc_details.jfc" target="_blank">gc_details.jfc</a>).

* SapMachine handles some `*OnOutOfMemoryError`switches differently than stock OpenJDK to be more useful in cloud scenarios. Behaviorial changes _highlighted with italics_:

  * `ExitOnOutOfMemoryError`
    * _also works for thread exhaustion OOMs_
    * also works for direct memory OOMs with system property -Djdk.nio.reportErrorOnDirectMemoryOom=true. Since 17.0.15/21.0.7
    * _prints stack to stdout_
    * prints "Terminating due to java.lang.OutOfMemoryError" to stdout
    * Exits the VM
  * `CrashOnOutOfMemoryError`
    * _also works for thread exhaustion OOMs_
    * also works for direct memory OOMs with system property -Djdk.nio.reportErrorOnDirectMemoryOom=true. Since 17.0.15/21.0.7
    * _prints stack to stdout_
    * writes an error report (hs_err_pid..)
    * prints "Aborting due to java.lang.OutOfMemoryError" to stdout
    * exits the VM
    * _will **NOT** write a core file unless `+CreateCoredumpOnCrash` was explicitly specified on the command line_
  * `HeapDumpOnOutOfMemoryError`
    * _also works for thread exhaustion OOMs_
    * also works for direct memory OOMs with system property -Djdk.nio.reportErrorOnDirectMemoryOom=true. Since 17.0.15/21.0.7
    * _prints stack to stdout_
    * generates heap dump
  * `OnOutOfMemoryError=command`
    * _also works for thread exhaustion OOMs (but note that whatever resource exhaustion caused thread creation errors may cause the subsequent fork for `command` to fail as well)_
    * _prints stack to stdout_
    * invokes the given command

  Notes:
  * Avoiding core file creation with `CrashOnOutOfMemoryError` is intentional. `CrashOnOutOfMemoryError` is by default tuned to shut the VM down with a minimum of fuzz while still giving us a useful error report. If a core file is wanted for post analysis, specify `-XX:+CreateCoreDumpOnCrash`.
  * For thread creation errors, `xxxOnOutOfMemoryError` switches are handled before the JVMTI ResourceExhausted event is posted. This means that JVMTI agents monitoring this event (e.g. CloundFoundry's `jvmkill`) may _not_ get invoked. This is intentional.
  * The SapMachine-specific flag `ExitVMOnOutOfMemoryError` (note the "VM" in the name, not to be confused with `ExitOnOutOfMemoryError`) is an alias to `CrashOnOutOfMemoryError` and provided for backward compatibility reasons.

## Enhanced tooling in the SapMachine JRE

Unlike standard OpenJDK JREs, the SapMachine JRE ships a set of diagnostic and monitoring tools that are typically only available in the full JDK:

* jcmd — send diagnostic commands to a running JVM
* jinfo — inspect JVM configuration and system properties
* jmap — generate heap dumps and memory maps
* jps — list running JVM processes
* jstack — capture thread dumps
* jstat — monitor JVM statistics (GC, class loading, JIT)

These tools are included to improve supportability in production environments where only a JRE is deployed.

## Cloud environment detection in crash reports

When a JVM crash occurs, SapMachine includes cloud infrastructure information in the hs_err crash report file. On Linux, SapMachine reads DMI (Desktop Management Interface) data to detect the cloud provider the JVM is running on — for example AWS, Azure, or GCP — and records it in the crash report.

This helps support and operations teams immediately identify the deployment environment without having to manually correlate crash files with infrastructure records, which is especially valuable when hs_err files are collected centrally from multiple environments.

## More context in crash reports

When the JVM crashes, the hs_err file captures a snapshot of what the JVM was doing at the time, including recent events such as locking, thread state changes, and GC activity. In standard OpenJDK, only the last 20 of these events are included — often not enough to understand what led to the crash.

SapMachine retains a significantly larger history of JVM events in every crash report, giving support teams more context to diagnose the root cause faster and with greater confidence.

## Additionally Included Software

SapMachine includes [async-profiler](https://github.com/jvm-profiling-tools/async-profiler) in the binary distribution.

We recommend using the latest SapMachine release. See our [installation and upgrade instructions](./installation).
