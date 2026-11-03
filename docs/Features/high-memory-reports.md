---
title: "High Memory Reports"
sidebar_position: 4
slug: /high-memory-reports
redirect_from:
  - /docs/High-Memory-Reports
  - /docs/sapmachine-high-memory-reports
---

{/* Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. */}

# SapMachine High Memory Reports

HiMemReport is a VM-internal facility that generates reports in low-memory situations. It only exists in SapMachine (for now, we may still contribute it upstream).

High Memory Reports are enabled with `-XX:+HiMemReport`.

A dedicated reporter thread will periodically poll the VM process's resident set and swap sizes when enabled. If the sum of both values hits certain threshold levels, it generates reports.

The thresholds are staggered at 66%, 75%, and 90% of a maximum *X*. Per default, *X* is:

- for containerized VMs, the container memory limit
- For non-containerized VMs, half of the total physical memory of the host.

The user can override *X* with any arbitrary value with option `-XX:HiMemReportMax=<X>`

----

![High Memory Report example](http://cr.openjdk.java.net/~stuefe/other/Vitals-HiMemRep/himemrep-1-normal.png)

----

## What is reported

The HiMemReport base report contains VM arguments, SapMachine Vitals, and NMT (for the latter, NMT has to be enabled with `-XX:NativeMemoryTracking=summary` or `=detail`).

In addition to the base report, the user can specify one or more arbitrary jcmds with `-XX:HiMemReportExec=<command>`. These jcmds will run after the base report is generated. Typical examples could be `VM.info`, `VM.metaspace` or `GC.heap_dump`.

## Where are the reports

All reports - base report and jcmd output - get written to **stderr** by default. However, the user can specify a directory into which reports are written instead (`-XX:HiMemReportDir=<directory>`). In that case the base report is named `sapmachine_himemalert_pid<pid>_<timestamp>.log`. Output from additional jcmds is written into separate files as `<command>_<pid>_<timestamp>.(out|err)`.

Example for `-XX:HiMemReportDir=/tmp/himem "-XX:HiMemReportExec=VM.info;VM.flags -all"`:

```text
thomas@starfish$ ls -al /tmp/himem/
total 176
drwxr-xr-x  2 thomas thomas  4096 Jun 17 15:56 .
drwxrwxrwt 26 root   root   36864 Jun 17 15:56 ..
-rw-rw-r--  1 thomas thomas  2485 Jun 17 15:56 sapmachine_himemalert_pid11015_2022_06_17_15_56_13.log
-rw-rw-r--  1 thomas thomas     0 Jun 17 15:56 VM.flags_pid11015_2022_06_17_15_56_13.err
-rw-rw-r--  1 thomas thomas 63568 Jun 17 15:56 VM.flags_pid11015_2022_06_17_15_56_13.out
-rw-rw-r--  1 thomas thomas     0 Jun 17 15:56 VM.info_pid11015_2022_06_17_15_56_13.err
-rw-rw-r--  1 thomas thomas 60764 Jun 17 15:56 VM.info_pid11015_2022_06_17_15_56_13.out
```

## Specifying additional jcmds

Use `-XX:HiMemReportExec` to specify additional jcmds to run after the base report. Multiple commands are separated with semicolons (`;`). Commands can contain arguments (make sure to use correct quoting in bash). See below for usage examples.

A particular case is `GC.heap_dump`. If specified as a jcmd to run, and if arguments are omitted, it will write the dump file as `GC.heap_dump_pid<pid>_<timestamp>.dump` into the report directory or the current working directory if the user did not specify a report directory.

## Reference

`-XX:+HiMemReport` enables high memory reports.
`-XX:HiMemReportMax=<memory size>`
overrides the maximum memory size the reporter references.
`-XX:HiMemReportDir=<dir>`
redirects reports into separate files in a common reporting directory; by
`-XX:HiMemReportExec=<command>[;<command2> ...]`
specify one or more commands to run

## Examples

`java -XX:+HiMemReport`

If Rss+Swap reaches 66%, 75% or 90% of the "natural" limit (container limit or 1/2 total physical memory), write a report to stderr.

`java -XX:+HiMemReport -XX:HiMemReportExec=VM.info`

If Rss+Swap reaches 66%, 75% or 90% of the "natural" limit:
write a report to stderr.
execute `jcmd VM.info` and write its output to stderr.

`java -XX:+HiMemReport -XX:HiMemReportDir=himem-reports -XX:HiMemReportMax=8g`

If Rss+Swap reach 66%, 75% or 90% of 8gb (which would be 5.28GB, 6GB or 7.2GB), write report to `./himem-reports/sapmachine_himemalert_pid<pid>_<timestamp>.log`

`java -XX:+HiMemReport -XX:HiMemReportDir=himem-reports '-XX:HiMemReportExec=VM.info;VM.flags -all;GC.heap_dump'`

Write reports to `./himem-reports/sapmachine_himemalert_pid<pid>_<timestamp>.log`. In addition:

- run `jcmd VM.info` on the VM and write the output to `./himem-reports/VM.info_pid<pid>_<timestamp>.out`.
- run `jcmd VM.flags -all` on the VM and write the output to `./himem-reports/VM.flags_pid<pid>_<timestamp>.out`.
- run `jcmd GC.heap_dump` on the VM and write the heap dump to `./himem-reports/GC.heap_dump_pid<pid>_<timestamp>.dump`.

## Technical notes

### Spike recognition

If the VM footprint recovers, the high memory reporting is reset, but only after a grace period of five minutes. Each report will contain a "spike number", the number of times the VM recovered from earlier spikes.

After a fixed number of resets, high memory reporting will be disabled to prevent flooding the disk with high memory reports.

### jcmd execution

`-XX:HiMemReportExec` jcmds are spawned as sub-processes (the VM calls `jcmd <pid> <command>` on itself). The reporter uses posix_spawn() for this, which should be using `vfork()` or `clone()`. So it should be cheap, low-memory friendly. Still, both the process of forking and jcmd need memory and may misfunction in low-memory scenarios.

## Troubleshooting

### I don't see the full report. Output from one or more jcmds is missing

The VM process may have ended before generating all reports. For example, the OOM-killer may have killed it, it may have ended naturally, or the enclosing container may have been stopped.
