---
title: "Cloud Foundry Buildpacks"
sidebar_position: 3
slug: /cloud-foundry-buildpacks
redirect_from:
  - /docs/sap-java-buildpack
  - /docs/SAP-Java-Buildpack
  - /docs/cloud-foundry
  - /docs/Cloud-Foundry
---

{/* Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. */}

# SapMachine in Cloud Foundry Buildpacks

In *SAP Business AI Platform (BAIP)* Cloud Foundry deployments (former SAP Business Technology Platform (BTP)), SapMachine is available as Java Runtime Environment (JRE) or Java Development Kit (JDK) via the **SAP JAVA Buildpack (SJB)** or the **Cloud Foundry Community Buildpack**.

In order to use the SapMachine JRE, set the following environment variable for your Cloud Foundry application:

`cf set-env <app_name> JBP_CONFIG_COMPONENTS '{jres: ["JavaBuildpack::Jre::SapMachineJRE"]}'`

`cf restage <app_name>`

Alternatively, you can declare the environment variable in the application's manifest file:

```yaml
  env:
      JBP_CONFIG_COMPONENTS: '{jres: ["JavaBuildpack::Jre::SapMachineJRE"]}'
```

or even specifying a concrete version, using the [version syntax](https://github.com/cloudfoundry/java-buildpack/blob/63545391234676b91642b7e0c5f946113ac8b3b4/docs/extending-repositories.md#version-syntax-and-ordering):

```yaml
  env:
      JBP_CONFIG_COMPONENTS: '{jres: ["JavaBuildpack::Jre::SapMachineJRE"]}'
      JBP_CONFIG_SAP_MACHINE_JRE: '{ jre: { version: 25.+ } }'
```

More detailed documentation is available on [help.sap.com](https://help.sap.com/docs/btp/sap-business-technology-platform/sapmachine) and in the [java-buildpack GitHub repository](https://github.com/cloudfoundry/java-buildpack/blob/master/docs/jre-sap_machine_jre.md).

To profile your application, obtain a heap dump or a thread dump, you can use our [cf java plugin](https://github.com/SAP/cf-cli-java-plugin).
