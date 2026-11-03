<!-- Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. -->

This repository is the source of the external SapMachine anchor page [sapmachine.io](https://sapmachine.io).

# Constraints (Mission Statement)

- **Intention/Target audience:** Inform customers and colleagues about SapMachine. Provide documentation, download links and release APIs.
- **Availability:** Keep the site reliably up all times, 24/7.
- **4 Eyes:** Changes need to be reviewed by a second person.

# sapmachine.io deployment process

![Deployment Diagram](./sapmachineIOPage_deployment.svg)

# Links

| Repository | Github Pages |
| ---------- | ------------ |
| [SapMachineIOPage](https://github.tools.sap/SapMachine/SapMachineIOPage) | [SapMachineIOPage GitHub Pages](https://pages.github.tools.sap/SapMachine/SapMachineIOPage/) |
| [SapMachine](https://github.com/SAP/SapMachine) | [SapMachine GitHub Pages](https://sap.github.io/SapMachine/) |
| [SapMachine-Infrastructure](https://github.com/SAP/SapMachine-infrastructure) | [sapmachine.io](https://sapmachine.io/) |

# Known external usage

Some endpoints/URLs on our pages are used by others. Lets try to list the known ones that we can inform them, in case of a change.

## [GitHub Actions - setup-java](https://github.com/actions/setup-java)

Discover JDKs through sapmachine-releases-all.json. Needs to be updated.

[src/distributions/sapmachine/installer.ts](https://github.com/actions/setup-java/blob/main/src/distributions/sapmachine/installer.ts#L65):

```text
    let fetchedReleasesJson = await this.fetchReleasesFromUrl(
      'https://sapmachine.io/assets/data/sapmachine-releases-all.json'
    );

    if (!fetchedReleasesJson) {
      fetchedReleasesJson = await this.fetchReleasesFromUrl(
        'https://sap.github.io/SapMachine/assets/data/sapmachine-releases-all.json'
      );
    }
```

## Java Buildpacks

Discover available JDKs/JREs from their code like configured here:

https://github.wdf.sap.corp/xs2-java/xs-java-buildpack/blob/master/resources/src/main/resources/config/sap_machine_jdk.yml
https://github.wdf.sap.corp/xs2-java/xs-java-buildpack/blob/master/resources/src/main/resources/config/sap_machine_jre.yml
https://github.tools.sap/buildpacks/cf-sjb/blob/main/resources/src/main/resources/config/sap_machine_jdk.yml
https://github.tools.sap/buildpacks/cf-sjb/blob/main/resources/src/main/resources/config/sap_machine_jre.yml
https://github.com/cloudfoundry/java-buildpack/blob/main/config/sap_machine_jre.yml

Needs https://sapmachine.io/assets/cf/{jre/jdk}/{platform}/{architecture}/index.yml for the relevant type/platform/architecture combinations.

For Paketo buildpacks there is only documentation which was fixed by these PRs:
https://github.com/paketo-buildpacks/paketo-website/pull/944
https://github.com/paketo-buildpacks/jvm-vendors/pull/24

## Stable links

```https://sapmachine.io/latest/<jdk-number>/<os-name>-<cpu-arch>/[jdk|jre]```

## [SapMachine Manager](https://github.com/SAP/sapmachine-manager-for-macos)

References assets/data/sapmachine-releases-latest.json in [Constants.h](https://github.com/SAP/sapmachine-manager-for-macos/blob/b615af3cd468810a78fc9ec4d1407a5544fa9b9f/source/Shared/Constants.h#L21)

## [sdkman](https://sdkman.io/)

They are using the disco API from foojay. Update URL through a PR:
https://github.com/foojayio/discoapi/pull/129

Found some occurrences of old URL in sdkman. Updated through PRs:
https://github.com/sdkman/sdkman.github.io/pull/135  
https://github.com/sdkman/new-sdkman.github.io/pull/13
