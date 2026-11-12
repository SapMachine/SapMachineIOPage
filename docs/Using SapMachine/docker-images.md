---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "OCI/Docker Images"
sidebar_position: 2
slug: /docker-images
redirect_from:
  - /docs/docker
  - /docs/Docker-Images
  - /docs/oci-images
---

# SapMachine Container Images

SapMachine provides container images for a variety of use cases, ranging from quickly running or exploring SapMachine in a container environment to building productive deployments on top of SapMachine base images.

For productive workloads, e.g. SAP business applications, we recommend using container images based on SAP Garden Linux. <a href="https://gardenlinux.org/" target="_blank">Garden Linux</a> is a Debian-based Linux operating system, maintained by SAP and optimized for container workloads, e.g. on Kubernetes managed by Gardener. Garden Linux is designed to be size-optimized and expose the smallest possible attack surface for CVEs and vulnerabilities. The turnaround time for closing newly discovered vulnerabilities is the quickest of all SapMachine container image types.

## Getting started

SapMachine images based on Garden Linux are available via GitHub Packages, hosted on the GitHub Container Registry (ghcr.io): <a href="https://github.com/SAP/SapMachine/pkgs/container/sapmachine" target="_blank">https://github.com/SAP/SapMachine/pkgs/container/sapmachine</a>

The simplest way to get started is to pull and run the latest image:

```sh
podman run --rm ghcr.io/sap/sapmachine java -version
```

This will run a container image with the JDK of the latest SapMachine release on the latest Garden Linux version.

As this might be a short-term OpenJDK release, you can also run an image with the latest LTS release, currently SapMachine 25:

```sh
podman run --rm ghcr.io/sap/sapmachine:lts java -version
```

These images contain a full JDK in a so-called "headful" variant. Since the JDK is quite large and contains development tools, and since "headful" means that libraries for displaying graphics, playing sound, etc. are included, the image can be unnecessarily large for backend business applications. To get an environment better suited for such applications, it might be desirable to use a headless JRE instead, e.g.:

```sh
podman run --rm ghcr.io/sap/sapmachine:25-jre-headless java -version
```

> **Note:** All examples use `podman`, but `docker` works as a drop-in replacement in all commands above.

## Using tags to pull/pin specific versions

Tags follow the pattern:

```text
<SapMachine version>-<package type>-<Garden Linux version>
```

Each component is optional and defaults to the latest available if omitted:

| Component | Description | Examples | Default |
| --- | --- | --- | --- |
| `<SapMachine version>` | Major or specific version; `lts` resolves to the latest LTS release | `25`, `25.0.4`, `lts` | latest release |
| `<package type>` | JDK or JRE, headful or headless | `jdk`, `jre`, `jdk-headless`, `jre-headless` | `jdk` |
| `<Garden Linux version>` | Major or specific Garden Linux version, prefixed with `gl-` | `gl-2150`, `gl-2150.4.0` | latest Garden Linux |

Components can be omitted freely — for example, `25-gl-2150` is valid and skips the package type. The `gl-` prefix unambiguously marks the start of the Garden Linux component, so there is no conflict with package type tokens. Some examples:

```sh
# Latest SapMachine JDK on latest Garden Linux (implicit :latest)
podman pull ghcr.io/sap/sapmachine

# Latest SapMachine 25 JDK on latest Garden Linux
podman pull ghcr.io/sap/sapmachine:25

# SapMachine 25.0.4 headless JRE on latest Garden Linux
podman pull ghcr.io/sap/sapmachine:25.0.4-jre-headless

# SapMachine 25 JDK pinned to a specific Garden Linux version
podman pull ghcr.io/sap/sapmachine:25-jdk-gl-2150.4.0
```

The images support `linux/amd64` and `linux/arm64` architectures. The correct variant is selected automatically when pulling on a supported platform.

Be careful with pinning to specific SapMachine or Garden Linux versions. While this may be needed in some cases, productive deployments should also provide automated version bumps in order to not miss out on important security updates.

## Supported updates & maintenance

Updates are only provided for active releases — both SapMachine versions that are currently in maintenance and container operating system versions that are still supported by their respective vendors (Garden Linux, Ubuntu, Alpine). Older tags will remain available and are not removed, but it is the user's responsibility to ensure they are using supported combinations of SapMachine and OS versions.

## Images on Docker Hub

On Docker Hub, we provide additional SapMachine images based on Ubuntu and Alpine. Details can be found at <a href="https://hub.docker.com/_/sapmachine" target="_blank">https://hub.docker.com/_/sapmachine</a>. These images are provided for broader compatibility and demonstrative purposes but may lack enterprise qualities and are therefore not suitable for use in productive deployments. Specifically in the case of productive SAP workloads, we will not support these images but ask users to migrate to Garden Linux-based images.

## Recommendations

- Build and maintain your own image variants based on SapMachine container images and your security policies for productive use.
- Scan images for vulnerabilities and apply your organization's hardening practices.
- Periodically check this page and the [Maintenance and Support](./maintenance-and-support) page for updates.
