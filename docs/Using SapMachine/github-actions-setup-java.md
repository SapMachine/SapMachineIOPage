---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "GitHub Actions setup-java"
sidebar_position: 4
slug: /github-actions-setup-java
redirect_from:
  - /docs/setup-java
  - /docs/gha
---

# GitHub Actions setup-java

SapMachine is available in GitHub actions workflows via [setup-java](https://github.com/actions/setup-java/).

```yaml
steps:
- uses: actions/setup-java@v5
  with:
    distribution: 'sapmachine'
    java-version: '25'
- run: java -cp java HelloWorldApp
```

More details are available at [actions/setup-java/README](https://github.com/actions/setup-java/blob/main/README.md) and [actions/setup-java/docs/advanced-usage](https://github.com/actions/setup-java/blob/main/docs/advanced-usage.md).
In case of general issues with actions/setup-java create an issue at [actions/setup-java/issues](https://github.com/actions/setup-java/issues).
In case of issues related distribution: 'sapmachine' only, please create an issue at [sapmachine/setup-java/issues](https://github.com/actions/setup-java/issues).
