---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "Download and Installation Guide"
sidebar_position: 4
slug: /installation
redirect_from:
  - /docs/Installation
---

# Download and Installation of SapMachine

## Download of SapMachine

SapMachine downloads for the latest versions can be found on <a href="https://sapmachine.io/" target="_blank">sapmachine.io</a>.

On the <a href="https://github.com/SAP/SapMachine/releases" target="_blank">SapMachine GitHub repository</a> you can also find older builds.

### Stable links

We also provide stable links to the latest version of maintained and supported releases of SapMachine, following the schema:

```text
https://latest.sapmachine.io/sapmachine-<major-version>-<os-name>-<cpu-architecture>-[jdk|jre].<ext>
```

The `<ext>` is `tar.gz` for Linux, AIX and macOS archives, `zip` for Windows archives, and `dmg` / `msi` for the macOS / Windows installers (the extension alone selects the installer). The filename is "speaking", so `curl -O` and `wget` save the download under a descriptive name. You can also use `latest` in place of the major version to always get the newest active (non-EA) major, e.g. `https://latest.sapmachine.io/sapmachine-latest-linux-x64-jdk.tar.gz`.

For example for SapMachine 25 you can download the latest version of SapMachine 25 JDK for MacOS aarch64 from <a href="https://latest.sapmachine.io/sapmachine-25-macos-aarch64-jdk.tar.gz" target="_blank">https://latest.sapmachine.io/sapmachine-25-macos-aarch64-jdk.tar.gz</a> or Sapmachine 25 JDK for Linux x64 from <a href="https://latest.sapmachine.io/sapmachine-25-linux-x64-jdk.tar.gz" target="_blank">https://latest.sapmachine.io/sapmachine-25-linux-x64-jdk.tar.gz</a>.

Find the link for any supported platform & version in the following table.

| OS | 17 LTS | 21 LTS | 25 LTS | 27 |
| -- | :------: | :------: | :------: | :-----: |
| AIX | | [JRE](https://latest.sapmachine.io/sapmachine-21-aix-ppc64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-aix-ppc64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-25-aix-ppc64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-25-aix-ppc64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-27-aix-ppc64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-27-aix-ppc64-jdk.tar.gz) |
| Linux aarch64 | [JRE](https://latest.sapmachine.io/sapmachine-17-linux-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-17-linux-aarch64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-21-linux-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-linux-aarch64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-25-linux-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-25-linux-aarch64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-27-linux-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-27-linux-aarch64-jdk.tar.gz) |
| Linux ppc64le | [JRE](https://latest.sapmachine.io/sapmachine-17-linux-ppc64le-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-17-linux-ppc64le-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-21-linux-ppc64le-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-linux-ppc64le-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-25-linux-ppc64le-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-25-linux-ppc64le-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-27-linux-ppc64le-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-27-linux-ppc64le-jdk.tar.gz) |
| Linux x64 (glibc) | [JRE](https://latest.sapmachine.io/sapmachine-17-linux-x64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-17-linux-x64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-21-linux-x64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-linux-x64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-25-linux-x64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-25-linux-x64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-27-linux-x64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-27-linux-x64-jdk.tar.gz) |
| Linux x64 (musl/alpine) | [JRE](https://latest.sapmachine.io/sapmachine-17-linux-x64-musl-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-17-linux-x64-musl-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-21-linux-x64-musl-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-linux-x64-musl-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-25-linux-x64-musl-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-25-linux-x64-musl-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-27-linux-x64-musl-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-27-linux-x64-musl-jdk.tar.gz) |
| MacOS aarch64 | [JRE](https://latest.sapmachine.io/sapmachine-17-macos-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-17-macos-aarch64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-21-macos-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-macos-aarch64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-25-macos-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-25-macos-aarch64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-27-macos-aarch64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-27-macos-aarch64-jdk.tar.gz) |
| MacOS aarch64 Installer | [JRE](https://latest.sapmachine.io/sapmachine-17-macos-aarch64-jre.dmg) / [JDK](https://latest.sapmachine.io/sapmachine-17-macos-aarch64-jdk.dmg) | [JRE](https://latest.sapmachine.io/sapmachine-21-macos-aarch64-jre.dmg) / [JDK](https://latest.sapmachine.io/sapmachine-21-macos-aarch64-jdk.dmg) | [JRE](https://latest.sapmachine.io/sapmachine-25-macos-aarch64-jre.dmg) / [JDK](https://latest.sapmachine.io/sapmachine-25-macos-aarch64-jdk.dmg) | [JRE](https://latest.sapmachine.io/sapmachine-27-macos-aarch64-jre.dmg) / [JDK](https://latest.sapmachine.io/sapmachine-27-macos-aarch64-jdk.dmg) |
| MacOS x64 | [JRE](https://latest.sapmachine.io/sapmachine-17-macos-x64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-17-macos-x64-jdk.tar.gz) | [JRE](https://latest.sapmachine.io/sapmachine-21-macos-x64-jre.tar.gz) / [JDK](https://latest.sapmachine.io/sapmachine-21-macos-x64-jdk.tar.gz) | | |
| MacOS x64 Installer | [JRE](https://latest.sapmachine.io/sapmachine-17-macos-x64-jre.dmg) / [JDK](https://latest.sapmachine.io/sapmachine-17-macos-x64-jdk.dmg) | [JRE](https://latest.sapmachine.io/sapmachine-21-macos-x64-jre.dmg) / [JDK](https://latest.sapmachine.io/sapmachine-21-macos-x64-jdk.dmg) | | |
| Windows x64 | [JRE](https://latest.sapmachine.io/sapmachine-17-windows-x64-jre.zip) / [JDK](https://latest.sapmachine.io/sapmachine-17-windows-x64-jdk.zip) | [JRE](https://latest.sapmachine.io/sapmachine-21-windows-x64-jre.zip) / [JDK](https://latest.sapmachine.io/sapmachine-21-windows-x64-jdk.zip) | [JRE](https://latest.sapmachine.io/sapmachine-25-windows-x64-jre.zip) / [JDK](https://latest.sapmachine.io/sapmachine-25-windows-x64-jdk.zip) | [JRE](https://latest.sapmachine.io/sapmachine-27-windows-x64-jre.zip) / [JDK](https://latest.sapmachine.io/sapmachine-27-windows-x64-jdk.zip) |
| Windows x64 Installer | [JRE](https://latest.sapmachine.io/sapmachine-17-windows-x64-jre.msi) / [JDK](https://latest.sapmachine.io/sapmachine-17-windows-x64-jdk.msi) | [JRE](https://latest.sapmachine.io/sapmachine-21-windows-x64-jre.msi) / [JDK](https://latest.sapmachine.io/sapmachine-21-windows-x64-jdk.msi) | [JRE](https://latest.sapmachine.io/sapmachine-25-windows-x64-jre.msi) / [JDK](https://latest.sapmachine.io/sapmachine-25-windows-x64-jdk.msi) | [JRE](https://latest.sapmachine.io/sapmachine-27-windows-x64-jre.msi) / [JDK](https://latest.sapmachine.io/sapmachine-27-windows-x64-jdk.msi) |

## Installation on Linux

### Debian or Ubuntu

On Debian-based Linux systems, e.g. Ubuntu, you can add the SapMachine Debian package repository to the system's repository list. With that you can install and update SapMachine via the apt package manager.

#### New-style repository (recommended)

The new-style repository uses the modern DEB822 format with a dedicated keyring. This is the recommended setup going forward:

```sh
sudo wget -qO /usr/share/keyrings/sapmachine.gpg https://dist.sapmachine.io/debian/sapmachine.gpg
sudo wget -qO /etc/apt/sources.list.d/sapmachine.sources https://dist.sapmachine.io/debian/sapmachine.sources
sudo apt-get update && sudo apt-get install sapmachine-25-jdk
```

#### Old-style repository (deprecated, end-of-life 2026-12-30)

> **Warning:** The old-style repository will no longer be available after 2026-12-30. Please migrate to the new-style repository above.

```sh
wget -qO- https://dist.sapmachine.io/debian/sapmachine.key > /etc/apt/trusted.gpg.d/sapmachine.asc
echo "deb https://dist.sapmachine.io/debian/$(dpkg --print-architecture)/ ./" > /etc/apt/sources.list.d/sapmachine.list
apt-get update
apt-get install sapmachine-25-jdk
```

### Alpine

For managing SapMachine on Alpine Linux systems, we provide and apk package repository. To use it, import the public key, and add the repository to the system list. Afterwards install the desired SapMachine release. E.g. run the following commands:

```sh
wget -qO /etc/apk/keys/sapmachine-apk.rsa.pub https://dist.sapmachine.io/alpine/sapmachine-apk.rsa.pub
echo "https://dist.sapmachine.io/alpine" >> /etc/apk/repositories
apk add sapmachine-25-jdk
```

### RPM

On RPM-based systems, e.g. Fedora, CentOS, or OpenSUSE, you can use `.rpm` packages.

#### Using yum

To use SapMachine RPM repositories with the yum package manager, import the public key and add the repository to the system list. Afterwards install the desired SapMachine release. E.g. run the following commands:

```sh
sudo rpm --import https://dist.sapmachine.io/rpm/sapmachine.key
sudo curl -L -o /etc/yum.repos.d/sapmachine.repo https://dist.sapmachine.io/rpm/sapmachine.repo
sudo yum install -y sapmachine-25-jdk
```

#### Using zypper

To use SapMachine RPM repositories with the zypper package manager, import the public key and add the repository to the system repository list. Afterwards install the desired SapMachine release. E.g. run the following commands:

```sh
sudo rpm --import https://dist.sapmachine.io/rpm/sapmachine.key
sudo curl -L -o /etc/zypp/repos.d/sapmachine-suse.repo https://dist.sapmachine.io/rpm/sapmachine-suse.repo
sudo zypper --gpg-auto-import-keys refresh
sudo zypper install -y sapmachine-25-jdk
```

### Download Binary Archives on Linux

It is also possible, to download a SapMachine binary archive to an arbitrary location in the file system. To use it, set environment variable `JAVA_HOME` to the root directory of the extracted archive (e.g. `/<...>/sapmachine-jdk-25.0.4`) and add `$JAVA_HOME/bin` to the environment variable `PATH`.

## Installation on MacOS

### SapMachine Manager

A very convenient way to install SapMachine versions and keep them up to date is to use the [SapMachine Manager](https://github.com/SAP/sapmachine-manager-for-macos). Install it from GitHub, then install the SapMachine version you need (default is the latest LTS) and SapMachine Manager will keep it up to date for you from there on. You can as well opt out from the autoupdate.

<img width="693" alt="sapmachine" src="https://github.com/SAP/SapMachine/assets/26298889/dcc3ee1c-becd-4aa3-9715-b71ef13a0cec" />

### Homebrew

The package manager <a href="https://brew.sh/" target="_blank">Homebrew</a> is another way to manage SapMachine installations on MacOS. To install <a href="https://brew.sh/" target="_blank">Homebrew</a>, follow the instructions on its <a href="https://brew.sh/" target="_blank">homepage</a>.

Then, to install the latest SapMachine do:

```sh
brew update
brew install sapmachine-jdk
```

To install other versions of SapMachine you can use our tap:

```sh
brew tap sap/sapmachine
brew install sapmachine25-jdk
```

#### Available casks

| Version                                | JDK                         | JRE                         |
|----------------------------------------|-----------------------------|-----------------------------|
| SapMachine &lt;MAJOR&gt; Released      | `sapmachine<MAJOR>-jdk`     | `sapmachine<MAJOR>-jre`     |
| SapMachine &lt;MAJOR&gt; Early Access  | `sapmachine<MAJOR>-ea-jdk`  | `sapmachine<MAJOR>-ea-jre`  |

Example:

```sh
brew install --cask sapmachine25-jdk
```

### Download Binary Archives on MacOS

Alternatively, you can download and unpack (double-click in finder) the SapMachine archive for macOS to an arbitrary location in the file system. You may want to move the resulting directory to `/Library/Java/JavaVirtualMachines` (admin privileges required). If you do so, `/usr/libexec/java_home -V` will show SapMachine. Moreover, if SapMachine is the most recent JDK, the `java` command in the shell will use it. You can try this with `java -version`.

If you prefer not to have SapMachine integrated in macOS' Java Framework, make sure to set `JAVA_HOME` to the root directory of the extracted archive (e.g. `/<...>/sapmachine-jdk-25.0.4`) and `PATH` (i.e. `$JAVA_HOME/bin`) environment variables.

## Installation on Windows

SapMachine installer packages (e.g. `*.msi` files) is the simplest way to install SapMachine on Windows.

Alternatively, you can download a SapMachine zip archive and unpack it to an arbitrary location in the file system. Then add the System variable `JAVA_HOME` and set it to the root directory of the extracted archive (e.g. `C:\<...>\sapmachine-jdk-25.0.4`). Edit the System variable `PATH` and add `%JAVA_HOME%\bin` to the `PATH`variable separated from the previous path by a semicolon.

## Installation with SDKMAN

[SDKMAN!](https://sdkman.io/), a platform independent package manager, supports SapMachine as well. Because of the current length limit in the SDKMAN! version string, SapMachine has to be abbreviated as `sapmchn`. Installing it with SDKMAN! is as simple as:

Example:

```sh
# Install SapMachine 25.0.4 with SDKMAN!
sdk install java 25.0.4-sapmchn
```
