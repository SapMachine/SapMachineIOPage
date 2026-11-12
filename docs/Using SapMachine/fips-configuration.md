---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "FIPS Configuration"
sidebar_position: 5
slug: /fips-configuration
---

# FIPS Configuration

SapMachine can be configured to be FIPS compliant by using Bouncy Castle as a JCA security provider.

## Adding Bouncy Castle as a Dependency

Add the Bouncy Castle FIPS jars to your project. Check [Maven Central](https://central.sonatype.com/search?q=bc-fips) for the latest versions.

**Maven:**

```xml
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bc-fips</artifactId>
    <version>2.1.2</version>
</dependency>
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bctls-fips</artifactId>
    <version>2.1.22</version>
</dependency>
```

**Gradle:**

```groovy
implementation 'org.bouncycastle:bc-fips:2.1.2'
implementation 'org.bouncycastle:bctls-fips:2.1.22'
```

## Configuring FIPS Mode via JVM Arguments

FIPS mode can be configured entirely via JVM arguments, no code changes required.

### `fips.security` File

Create a `fips.security` file that overrides the default `java.security` to register Bouncy Castle as the top-priority security providers:

```properties
security.provider.1=org.bouncycastle.jcajce.provider.BouncyCastleFipsProvider
security.provider.2=org.bouncycastle.jsse.provider.BouncyCastleJsseProvider fips:BCFIPS
security.provider.3=sun.security.provider.Sun
```

### JVM Arguments

Place the Bouncy Castle FIPS jars in a directory (e.g. `fips-libs/`) and pass the following arguments when launching the JVM:

- `--module-path <fips-libs-directory>` makes the Bouncy Castle FIPS jars available to the JVM.
- `-Djava.security.properties=fips.security` merges `fips.security` with the default `java.security`, registering BCFIPS and BCJSSE as the top-priority security providers.
- `-Dorg.bouncycastle.fips.approved_only=true` enables Bouncy Castle approved-only mode, which rejects non-FIPS algorithms such as MD5.

### Example

```bash
java \
  --module-path /path/to/fips-libs \
  -Djava.security.properties=fips.security \
  -Dorg.bouncycastle.fips.approved_only=true \
  -jar your-application.jar
```

### Using Java Tools (keytool, jarsigner, etc.)

When using JDK tools rather than launching your own application, pass the same arguments via the `JAVA_TOOL_OPTIONS` environment variable:

```bash
export JAVA_TOOL_OPTIONS="\
  --module-path=/path/to/fips-libs \
  -Djava.security.properties=fips.security \
  -Dorg.bouncycastle.fips.approved_only=true"

keytool ...
```

## The Sun Provider and Entropy

The `fips.security` configuration above keeps `sun.security.provider.Sun` as provider 3. One of its purposes is to provide entropy for seeding the BCFIPS Deterministic Random Bit Generator (DRBG): `SecureRandom` from the Sun provider reads from `/dev/random` or `/dev/urandom` on Linux. This entropy is **only FIPS-validated if the underlying OS is itself FIPS-certified**.

### Alternative: Bouncy Castle JENT Entropy Provider

If a pure-software, FIPS-validated entropy source is required without depending on OS FIPS certification, the Bouncy Castle JENT provider can replace the Sun provider as the entropy source. You can read more about it in [JEntropy Engine PDF](https://csrc.nist.gov/CSRC/media/projects/cryptographic-module-validation-program/documents/entropy/E266_PublicUse.pdf).

> **NOTE:** JENT is significantly slower than reading from `/dev/random`, especially during key generation. It is supported on Intel x86 and ARM Linux only. Prefer hardware RNG or OS-based entropy where available.

Check [Maven Central](https://central.sonatype.com/search?q=bc-rng-jent) for the latest versions and add the Maven dependency:

```xml
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bc-rng-jent</artifactId>
    <version>1.3.6</version>
</dependency>
```

Then update `fips.security` to use the JENT provider and configure BCFIPS in HYBRID mode (which uses a background entropy pool to reduce blocking):

```properties
security.provider.1=org.bouncycastle.jcajce.provider.BouncyCastleFipsProvider C:HYBRID;ENABLE{ALL};
security.provider.2=org.bouncycastle.jsse.provider.BouncyCastleJsseProvider fips:BCFIPS
security.provider.3=org.bouncycastle.entropy.provider.BouncyCastleEntropyProvider
security.provider.4=sun.security.provider.Sun
securerandom.strongAlgorithms=ENTROPY:BCRNG
```

`C:HYBRID;ENABLE{ALL};` tells BCFIPS to collect entropy in the background continuously rather than only on demand. Without this, each cryptographic operation that needs fresh entropy blocks until enough jitter measurements have been taken, which with JENT can be noticeably slow. With HYBRID mode a background thread ("BC FIPS Entropy Daemon") keeps a pool of pre-collected entropy ready, so foreground operations rarely have to wait.

## Removing Non-FIPS-Compliant Algorithms

The Sun provider also exposes non-FIPS algorithms (e.g. MD5, SHA-1 based operations). Because BCFIPS is registered at priority 1, most JCA/JCE calls will be routed to it, but code that explicitly requests `"SUN"` as the provider can still reach non-FIPS algorithms. Beyond having Bouncy Castle reject non-FIPS algorithms at runtime, you can proactively remove them from the JDK itself by extending the `fips.security` override file with the JDK's built-in algorithm constraint properties. This prevents non-compliant algorithms from being negotiated even by JDK-native code paths.

Add the following properties to your `fips.security` file that are stricter than the Java defaults:

```properties
# Larger key required size for DH, and block weak named curves
jdk.tls.disabledAlgorithms=DH keySize < 2048, include jdk.disabled.namedCurves

# Larger key size required for RSA
jdk.certpath.disabledAlgorithms=RSA keySize < 2048
```

To replace the JDK defaults entirely instead of merging, use a double equals sign: `-Djava.security.properties==fips.security`. In that case you must carry the full JDK default lists yourself in addition to the FIPS-specific entries above.

> **Note:** The exact set of algorithms to disable depends on your compliance target (FIPS 140-2 vs. 140-3) and your environment. Review and adjust these lists to match your specific requirements.
