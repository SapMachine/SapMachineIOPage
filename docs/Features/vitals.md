---
title: "SapMachine Vitals"
sidebar_position: 2
slug: /vitals
redirect_from:
  - /docs/Vitals
  - /docs/sapmachine-vitals
---

{/* Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. */}

# SapMachine Vitals

**SapMachine Vitals** is a monitoring facility for the SapMachine. It keeps a long-term log of system- and VM metrics considered vital (hence the name).

It has been proposed to the OpenJDK through <a href="https://bugs.openjdk.org/browse/JDK-8212618" target="_blank">JDK-8212618: A low-cost, always on statistical value history</a> but was not accepted. So we decided to implement it as a feature in SapMachine.

## How it works

Vitals periodically poll the VM and the operating system for essential ("vital") data. Per default, this happens every ten seconds.

These data samples are kept in a short-term high-resolution buffer for an hour; after that period, they are downsampled to a long-term low-resolution buffer that spans ten days.

## Costs

The Vitals are very frugal in terms of memory and CPU costs:

- memory overhead about 300KB
- performance overhead, with the normal sample interval of 10 seconds, is not measurable (we really tried).

Since they are so low-cost, they are enabled in the SapMachine by default.

## What reports look like

```text
------------system------------
           avail: Memory available without swapping [host]
            comm: Committed memory [host]
             crt: Committed-to-Commit-Limit ratio (percent) [host]
            swap: Swap space used [host]
              si: Number of pages swapped in [host] [delta]
              so: Number of pages pages swapped out [host] [delta]
               p: Number of processes
               t: Number of threads
              tr: Number of threads running
              tb: Number of threads blocked on disk IO
          cpu-us: CPU user time [host]
          cpu-sy: CPU system time [host]
          cpu-id: CPU idle time [host]
          cpu-st: CPU time stolen [host]
          cpu-gu: CPU time spent on guest [host]
      cgroup-lim: cgroup memory limit [cgrp]
     cgroup-slim: cgroup memory soft limit [cgrp]
      cgroup-usg: cgroup memory usage [cgrp]
     cgroup-kusg: cgroup kernel memory usage (cgroup v1 only) [cgrp]
           mload: percentage of physical memory in use [windows]
      avail-phys: physical memory available [windows]
            wset: working set size [windows]
           comch: Commit charge [windows]
-----------process------------
            virt: Virtual size
         rss-all: Resident set size, total
        rss-anon: Resident set size, anonymous memory [krn]
        rss-file: Resident set size, file mappings [krn]
         rss-shm: Resident set size, shared memory [krn]
            swdo: Memory swapped out
       cheap-usd: C-Heap, in-use allocations [glibc]
      cheap-free: C-Heap, bytes in free blocks [glibc]
          cpu-us: Process cpu user time
          cpu-sy: Process cpu system time
           io-of: Number of open files
           io-rd: IO bytes read from storage or cache
           io-wr: IO bytes written
             thr: Number of native threads
-------------jvm--------------
       heap-comm: Java Heap Size, committed
       heap-used: Java Heap Size, used
       meta-comm: Meta Space Size (class+nonclass), committed
       meta-used: Meta Space Size (class+nonclass), used
        meta-csc: Class Space Size, committed [cs]
        meta-csu: Class Space Size, used [cs]
       meta-gctr: GC threshold
            code: Code cache, committed
         nmt-mlc: Memory malloced by hotspot [nmt]
         nmt-map: Memory mapped by hotspot [nmt]
          nmt-gc: NMT "gc" (GC-overhead, malloc and mmap) [nmt]
         nmt-oth: NMT "other" (typically DBB or Unsafe.allocateMemory) [nmt]
         nmt-ovh: NMT overhead [nmt]
        jthr-num: Number of java threads
         jthr-nd: Number of non-demon java threads
         jthr-cr: Threads created [delta]
         jthr-st: Total reserved size of java thread stacks [nmt] [linux]
        cldg-num: Classloader Data
       cldg-anon: Anonymous CLD
         cls-num: Classes (instance + array)
          cls-ld: Class loaded [delta]
         cls-uld: Classes unloaded [delta]

   [host]: values are host-global (not containerized).
   [cgrp]: if containerized or running in systemd slice
    [krn]: depends on kernel version
   [glibc]: only shown for glibc-based distros
  [delta]: values refer to the previous measurement.
    [nmt]: only shown if NMT is available and activated
     [cs]: only shown on 64-bit if class space is active
  [linux]: only on Linux
[windows]: only on Windows
(Vitals version 220600, pid: 18158)

Last 60 minutes:
                      -----------------------------------system ----------------------------------- -----------------------------process----------------------------- -----------------------------------jvm------------------------------------
                                                                ------cpu------ ------cgroup------       --------rss---------      --cheap-- -cpu- -----io------     --heap--- ---------meta----------      ---jthr--- --cldg-- ------cls------
                      avail comm  crt swap si so p   t    tr tb us sy id  st gu lim slim usg  kusg virt  all   anon file shm  swdo usd  free us sy of  rd   wr   thr comm used comm used csc  csu gctr code num nd cr  num anon num   ld    uld
2022-06-17 17:04:43   56,0g 17,6g  52   0k  0  0 570 1683  2  0  6  0  93  0  0          9,3g 247m 14,3g  1,8g 1,8g  58m 100k   0k 138m 392m  6  0 135   6m  38m  94 1,1g 517m 120m 117m  14m 13m 199m  66m  47 27   8 631  376 21456    10   0
2022-06-17 17:04:33   56,0g 17,9g  53   0k  0  0 570 1751  2  0  8  0  92  0  0          9,3g 247m 14,3g  1,8g 1,8g  58m 100k   0k 148m 393m  7  0 135  11m 112m  94 1,1g 737m 120m 117m  14m 13m 199m  65m  47 27   9 629  374 21446    15   0
2022-06-17 17:04:23   56,0g 18,1g  54   0k  0  0 571 1784  2  0  7  0  93  0  0          9,2g 247m 14,3g  1,8g 1,8g  58m 100k   0k 139m 394m  6  0 135   9m  36m  94 1,1g 440m 119m 117m  14m 13m 199m  64m  48 27   7 629  374 21431    32   0
2022-06-17 17:04:13   56,0g 18,1g  54   0k  0  0 570 1786  4  0  9  0  90  0  0          9,2g 246m 14,3g  1,9g 1,8g  58m 100k   0k 144m 390m  9  0 135   8m  62m  96 1,1g 677m 119m 116m  14m 13m 198m  63m  50 27   9 600  345 21399     4   0
2022-06-17 17:04:03   56,0g 17,8g  53   0k  0  0 570 1771  4  0 15  1  85  0  0          9,1g 243m 14,3g  1,7g 1,7g  58m 100k   0k 189m 353m 13  0 135  10m  40m  96 998m 614m 119m 116m  14m 13m 198m  62m  50 27  12 600  345 21395    44   0
2022-06-17 17:03:53   56,2g 17,4g  52   0k  0  0 569 1721  2  0  8  0  92  0  0          8,9g 239m 14,3g  1,7g 1,6g  58m 100k   0k 134m 363m  7  0 135   5m  51m  94 998m 684m 118m 115m  14m 13m 197m  59m  48 27  10 600  345 21351     3   0
2022-06-17 17:03:43   56,3g 17,5g  52   0k  0  0 569 1703  3  0  5  0  94  0  0          8,8g 239m 14,3g  1,5g 1,5g  58m 100k   0k 141m 347m  5  0 136 142k   2m  94 868m 555m 118m 115m  14m 13m 196m  58m  48 27   1 600  345 21348     2   0
2022-06-17 17:03:33   56,3g 17,2g  51   0k  0  0 569 1681  4  0  5  0  94  0  0          8,8g 238m 14,3g  1,5g 1,5g  58m 100k   0k 122m 371m  5  0 136 148k   2m  93 868m 481m 118m 115m  14m 13m 196m  58m  47 27   0 600  345 21346     0   0
2022-06-17 17:03:23   56,4g 17,2g  51   0k  0  0 569 1675  2  0  5  0  95  0  0          8,7g 238m 14,3g  1,5g 1,5g  58m 100k   0k 120m 366m  4  0 136 153k   2m  93 868m 664m 118m 115m  14m 13m 196m  58m  47 27   0 600  345 21346     0   0
2022-06-17 17:03:13   56,4g 17,1g  51   0k  0  0 569 1665  2  0  7  0  93  0  0          8,7g 238m 14,3g  1,5g 1,5g  58m 100k   0k 126m 359m  6  0 135   7m  30m  93 868m 637m 118m 115m  14m 13m 196m  58m  47 27   4 600  345 21346    39   0
2022-06-17 17:03:03   56,5g 17,2g  51   0k  0  0 569 1675  5  0  8  0  91  0  0          8,6g 237m 14,3g  1,5g 1,4g  58m 100k   0k 164m 315m  7  0 135 270k   7m 101 868m 486m 117m 115m  14m 13m 192m  57m  55 27  14 598  345 21307    41   0
2022-06-17 17:02:53   56,5g 17,0g  50   0k  0  0 569 1653  4  0 13  1  87  0  0          8,6g 236m 14,3g  1,4g 1,4g  58m 100k   0k 192m 289m 12  0 135  15m   5m  98 868m 431m 116m 114m  14m 13m 192m  54m  52 27  15 598  345 21266   406   2
2022-06-17 17:02:43   57,0g 16,4g  49   0k  0  0 569 1639  1  0  3  1  97  0  0          8,1g 234m 14,3g  935m 877m  58m 100k   0k 148m 251m  2  0 135   8m   4m  82 354m 149m 113m 110m  14m 13m 168m  46m  47 27  28 577  329 20862   528   0
2022-06-17 17:02:33   57,1g 16,4g  49   0k  0  0 569 1672  1  0  0  0 100  0  0          8,0g 234m 14,3g  863m 806m  58m   0k   0k 111m 230m  0  0 140 138k  <1k 114 354m 173m 108m 105m  13m 12m 168m  39m  80 60   0 563  315 20334     0   0
2022-06-17 17:02:23   57,1g 16,4g  49   0k  0  0 569 1675  1  0  0  0 100  0  0          8,0g 234m 14,3g  863m 806m  58m   0k   0k 111m 230m  0  0 139 137k   5k 117 354m 173m 108m 105m  13m 12m 168m  39m  83 61   0 563  315 20334     0   0
2022-06-17 17:02:13   57,1g 16,4g  49   0k  0  0 569 1673  1  0  0  0  99  0  0          8,0g 234m 14,3g  863m 806m  58m   0k   0k 111m 230m  0  0 138 128k  <1k 117 354m 173m 108m 105m  13m 12m 168m  39m  83 61   0 563  315 20334     0   0
2022-06-17 17:02:03   57,1g 16,4g  49   0k  0  0 569 1673  1  0  1  0  99  0  0          8,0g 234m 14,3g  872m 814m  58m   0k   0k 115m 234m  0  0 138 158k   3m 118 354m 173m 108m 105m  13m 12m 168m  39m  84 61   4 563  315 20334     0   0
2022-06-17 17:01:53   57,1g 16,5g  49   0k  0  0 569 1682  1  0  0  0 100  0  0          8,0g 234m 14,3g  857m 799m  58m  68k   0k 113m 222m  0  0 137 214k  <1k 119 354m 158m 108m 105m  13m 12m 168m  39m  85 62   2 563  315 20334    18   0
2022-06-17 17:01:43   57,1g 16,5g  49   0k  0  0 569 1690  1  0  3  1  95  0  0          8,0g 235m 14,3g  856m 799m  58m  68k   0k 112m 222m  3  1 136   5m 352k 119 354m 157m 108m 105m  13m 12m 168m  39m  84 60 152 563  315 20316  1688   2
2022-06-17 17:01:33   56,9g 17,0g  51   0k  0  0 569 1695  2  0 15  2  83  0  0          8,1g 235m 13,1g 1005m 948m  57m  68k   0k 161m 102m 15  1 137 115m   4m 104 768m 425m  98m  96m  12m 11m 101m  35m  69 22  89 494  264 18630 17907   3
2022-06-17 17:01:23   57,9g 16,3g  48   0k       569 1615  5  0                          7,2g 230m  7,0g   37m  11m  25m   0k   0k  42m   2m         2            21 260m   5m 448k 266k 128k  8k  21m   7m  13  1       7    4   726
```

## How to obtain reports

Vitals can be obtained with `jcmd <pid> VM.vitals`. Without options, a human-readable table is printed. Options include:

- output the report in CSV form to use in spreadsheets: `jcmd <pid> VM.vitals csv`
- one can specify the memory unit explicitly: `jcmd <pid> VM.vitals scale=M`
- by default, values are printed newest-to-oldest. Print order can be reversed, e.g. for CSV reports: `jcmd <pid> VM.vitals reverse CSV`

The user can obtained also via command-line options `-XX:+PrintVitalsAtExit` or `-XX:+DumpVitalsAtExit`. The VM will print Vitals to stdout or to a file on shutdown. With `-XX:+DumpVitalsAtExit`, the file name can be overridden with `-XX:VitalsFile=<filename>`.

These switches are a convenient way to get metrics at the end of a java program, especially if it has a very short run time  ("poor man's flight recorder").

Finally, Vitals are printed as part of error reports (`hs_err_<pid>.log`).

### Vitals and Native Memory Tracking

Vitals use Native Memory Tracking (NMT) for some of the more useful metrics. NMT is a JVM facility that tracks native memory usage. However, it adds some memory overhead and is therefore disabled by default.

If you use Vitals to track down native memory issues, we recommend enabling NMT with `-XX:NativeMemoryTracking=summary`.

## Command-Line Options

| Option | Function |
| ------------- | ------------- |
| `-XX:(+-)EnableVitals` | Enable/disable Vitals. Note that since Vitals are enabled by default this switch can be used to explicitly disable them: `-XX:-EnableVitals`. |
| `-XX:(+-)PrintVitalsAtExit` | Prints Vitals to stdout upon (normal or abnormal) VM exit. |
| `-XX:(+-)DumpVitalsAtExit` | Dumps a Vitals report to a file upon (normal or abnormal) VM exit. The file will be written to the current directory and named sapmachine_vitals_&lt;pid>.log. The location of the file can be overridden via `-XX:VitalsFile`. |
| `-XX:VitalsFile=<filename>` | Specify the Vitals file path for `-XX:+DumpVitalsAtExit`. |
| `-XX:VitalsSampleInterval=<seconds>` | Override the Vitals sample interval. |

## How to read this report

Vitals are a developer tool, mainly aimed at hotspot devs and support people; interpreting the values requires solid OS- and JVM knowledge (especially for memory management). Be careful what conclusions you draw from these numbers.

The metrics were selected for our support, hence heavily biased toward the typical problems plaguing our customers. Frequently these are high memory pressure scenarios; therefore, metrics include many memory data.

The columns are grouped into three (Linux) categories: "system" (host- or container-global values), "process" (process-local values) and "jvm". The Legend shown is pretty self-explanatory, but here are some of the most important columns:

### JVM section

| Column | Notes |
| ------------- | ------------- |
| heap-comm, heap-used | Java Heap Size, committed and used |
| meta-comm, meta-used | Total Metaspace size, committed and used. Note that this includes both Class space (if active) as well as non-class metaspace. As a rule of thumb, any value up to about 5-10KB per loaded class is okay. You can see the number of loaded classes in this table (column `cls-num`). Memory sizes larger than ~10KB per class may hint at excessive metaspace fragmentation. |
| meta-csc, meta-csu | This is the portion of metaspace reserved for class space. This seldom is a problem. |
| meta-gctr | Metaspace GC threshold. Often misunderstood: this is just a number. If committed total metaspace grows beyond this threshold, the VM will attempt a GC to clean out class loaders before allowing further metaspace growth. The badly misnamed VM parameter `-XX:MetaspaceSize` sets the initial value of the Metaspace GC threshold. |
| code | Committed code cache. |
| nmt-mlc | How much NMT thinks the VM did malloc(3). Only shows usage from within the hotspot, and only user payload sizes. It includes NMT overhead. It leaves out most usage from outside the hotspot. It also leaves out overhead from within the glibc, which can be significant. See also column `cheap-usd` and `cheap-fre`. |
| nmt-map | How much NMT thinks the VM did mmap(3) (committed). Includes committed portions of large areas like the java heap, code cache, and metaspace. |
| nmt-gc | How much the VM allocated for heap-related side structures (e.g. remembered set or card table). |
| nmt-oth | A high value here may indicate excessive DirectByteBuffer allocations. |
| nmt-ovh | NMT overhead. |
| jthr-num | number of java threads. |
| jthr-nd | Number of non-demon java threads. |
| jthr-cr | How many java threads were created since the last data sample (per default, in the last ten seconds). |
| jthr-st | Total committed size of java thread stacks. |
| cldg-num | Number of CLD structures; roughly translates to the number of class loaders (including loaders created due to reflection inflation, and for JDK&lt;16 hidden loaders caused by Lambdas). |
| cls-num | Total number of classes |
| cls-ld, cls-uld | number of classes loaded/unloaded in the last ten seconds. High load-unload churns may increase Metaspace fragmentation, though this is less of a problem since JEP 387. |

### Process section (Linux-specific)

| Column | Notes |
| ------------- | ------------- |
| virt | Virtual process size. Don't sweat this number. With modern kernels on 64-bit platforms, this value is meaningless unless you plan to use >128 TB heap. In particular, this memory size does not incur any real memory cost. |
| rss-all | RSS (resident set size). In combination with SWAP (`swdo`) this is the real footprint of the process you should be concerned about. |
| swdo | How much memory has this process swapped out. Ideally, this should be zero. |
| cheap-usd | How much memory this process has allocated via malloc(3) in the C-heap. This size includes allocations from all parts of the process, not just the hotspot, and also contains glibc-internal overhead. The overhead can be significant. Compared with `nmt-mlc`, this number can be much higher. *Note: may be imprecise on glibc versions < 2.34*. |
| cheap-fre | memory the process did free(3), but the glibc holds on for future use in the C-heap. If this is significant, it can be released manually with `jcmd <pid> System.trim_native_heap`, but be aware that doing so frequently may have performance costs. *Note: may be imprecise on glibc versions < 2.34, or after a C-heap trim*. |
| thr | number of native threads. This number includes threads not associated with the JVM. |

### System section (Linux-specific)

| Column | Notes |
| ------------- | ------------- |
| avail | How much memory is available on this host. Note that this shows the host value even when inside a container. |
| comm | How much memory the host has committed. The amount of committable memory is limited. It depends on the overcommit setting of the kernel (see https://www.kernel.org/doc/Documentation/vm/overcommit-accounting). On most machines, it is larger than the amount of physical memory but not endlessly, typically by a factor of 1.5. |
| crt | Commit ratio, in percent. A value of 100 means we have 100% of the committable memory committed. Higher values than 100 are possible if the system allows overcommit. |
| swap | Total swap space used on the host. |
| si, so | number of pages swapped in and out in the last ten seconds. High values here mean high swap activity. |
| p, t | Number of processes and threads on this host or inside the container. |
| cgroup-lim, cgroup-slim | The memory limit and the soft limit of the cgroup the process lives in. For cgroups v1, this is `memory.limit_in_bytes` and `memory.soft_limit_in_bytes`. For cgroups v2, this is "memory.max" and "memory.low". |
| cgroup-usg | Current memory usage (v1: "memory.usage_in_bytes", v2: "memory.current") of the containing cgroup. |
| cgroup-kusg | Current kernel memory usage of the cgroup. Only shown for v1. |
| mload | Approximate percentage of physical memory that is in use on the computer. |
| avail-phys | Amount of physical memory currently available. More specific it is the memory directly available for use without having to be written to disk first. |
| wset | Working set size of the process. |
| comch | The commit charge, which is the total amount of private memory that the memory manager has committed for the process. |
