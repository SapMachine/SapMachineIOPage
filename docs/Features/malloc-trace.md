---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "Malloc Trace"
sidebar_position: 3
slug: /malloc-trace
---

# Malloc Trace

## Quick overview

The SapMachine malloc trace is a tool for finding native memory leaks or getting an overview of the native memory usage (how much is allocated by whom). It tracks all memory allocations via malloc(), calloc(), realloc() and similar methods in the whole JVM process. If tracking free() calls is enabled too, it knows the currently live memory and the methods which allocated it.

This feature is only available on Linux and MacOSX versions of the JVM.

To be able to use the trace, the VM has to be started with the `-XX:+UseMallocHooks` flag. Then the malloc trace can be enabled via the following `jcmd` calls (`<pid>` is the process id of the VM process for which to trace):

`jcmd <pid> MallocTrace.enable`

Now every call to `malloc`, `calloc` and so on is intercepted and a stack trace is taken. To view current statistic about the tracked allocations, the following `jcmd` can be used:

`jcmd <pid> MallocTrace.dump`

This returns the 10 stacks with the biggest total allocation size. To get more than the top 10 stacks, the '-max-entries' option can be used:

`jcmd <pid> MallocTrace.dump -max-entries=50`

Note that this is not the currently allocated memory, but the total allocations since the start of the trace. If you only want to see the memory still in use, you must enable the malloc trace with the `-track-free` flag. This uses more memory and costs some additional performance.

`jcmd <pid> MallocTrace.enable -trace-free`

The malloc trace can be disabled via:

`jcmd <pid> MallocTrace.disable`

To get a list of all the jcmd options supported by the VM use:

`jcmd <pid> help MallocTrace.enable`.

`jcmd <pid> help MallocTrace.dump`.

## Understanding the dump

Here is what a typical dump will look like

~~~text
Stacks were collected via the fallback mechanism.
Contains every allocation done since enabling.
Stack 1 of 5593: 202,475,760 (193 M, 6.51 %) bytes, 736 (0.03 %) allocations
  [0x00007f6e0b5e2264]  malloc+71 in libmallochooks.so
  [0x00007f6e09d7d10f]  os::malloc(unsigned long, MEMFLAGS, NativeCallStack const&)+153 in libjvm.so
  [0x00007f6e092728ce]  Chunk::operator new(unsigned long, AllocFailStrategy::AllocFailEnum, unsigned long)+400 in libjvm.so
  [0x00007f6e092731f6]  Arena::grow(unsigned long, AllocFailStrategy::AllocFailEnum)+72 in libjvm.so
...

Printed 10 stacks
Total unique stacks: 5,593
Total allocated bytes: 3,110,684,597 (2.9 G)
Total allocation count: 2,236,965
Total printed bytes: 498,194,930 (475 M, 16.0 %)
Total printed count: 2,777 (0.12 %)

Dumping done in 0.076 s (0.000 s of that locked)
~~~

Lets examine in line by line.

The first line "`Stacks were collected via the fallback mechanism.` indicates that the stack traces were not taken by `backtrace()/libunwind`. This is the fastest way, but the stack trace might include less detailed information for the functions or end prematurely.

The second line `Contains every allocation done since enabling.`is printed when the dump includes all allocations. If the `free()`calls would have also been tracked, the line would read `Contains the currently allocated memory since enabling.` This means the dump only contains allocations for memory which still has not been freed.

Next are the entries for each stack, sorted by size or count. For the first entry in the example (`Stack 1 of 5593: 202,475,760 (193 M, 6.51 %) bytes, 736 (0.03 %) allocations)`, the first value is the size in bytes. In the parenthesis the human readable size and the percentage follows. The percentage is relative to the sum of all tracked allocations. Then follows the number of allocation and the percentage in parenthesis.

The stack trace is printed frame by frame. A frame looks like `[0x00007f6e09d7d10f]  os::malloc(unsigned long, MEMFLAGS, NativeCallStack const&)+153 in libjvm.so`. The first hexedecimal value is the program counter of the frame's method. This information is always available.

Most of the time the VM is able to determine the name of the method too. In this case the method is `os::malloc`. Depending on the debug information available for the method, you can get the methods parameters (like in our case) or not.

If we know the method, we also print the program counter as an offset from the start address of the method. In our case this is `+153`.

And lastly, if this code is in a library, the name of the library is added (`libjvm.so`in our case).

After the stack entries, we have a summary section in each dump, which should be self explanatory.

## Options for MallocTrace.enable

The `MallocTrace.enable` command support several options:

* `-stack-depth=<depth>`: This sets the maximum number of stack frames to store when tracking an allocation. Increasing this value increases the runtime overhead and the memory used for the trace.
* `-use-backtrace`: If this flag is supplied, the stack walking is done via the `backtrace` method of the glibc. On MacOSX and Alpine Linux the VM tries to load `libunwind` instead. If neither could be found or the flag is not used, the fallback build-in method to walk the stack is used. Using the fallback is usually faster, but might lead to stack traces with less accurate information.
* `-only-nth=<n-th>`: If given, not every allocation is tracked. For example `-only-nth=3` would only track about every third allocation. This leads to a smaller memory and performance overhead. Note that the sampling is done somewhat randomly to avoid problems with allocations done at regular intervals.
* `-force`: Normally the enable command fails if the trace is already enabled. Using `-force` disables and then enables the trace in this case.
* `-track-free`: If given, not only the allocation calls like `malloc` or `calloc` are tracked, but freeing the memory is tracked too. This means the dumps only contain memory allocations still used. Note that this feature consumes significantly more memory and has a higher runtime overhead.
* `-detailed-stats`: If given, some internal statistics about the memory usage and performance overhead of the trace itself are sampled and can later be retrieved via the `MallocTrace.dump` command.

## Options for MallocTrace.dump

The `MallocTrace.dump` command supports this options:

* `-dump-file=<file>`: This instructs the VM to send the output not the the jcmd, but write it to the given file instead. The special filenames `stdout` and `stderr` can be used to dump the output the the output or error stream of the tracked VM. A side effect of using this option is the decreased memory usage of the dump itself, since the *whole* output has not to be cached by the VM (as would be the case for output via jcmd). This is especially useful if you want to dump a larger number of entries.
* `-filter`: This instructs the dump command to only include stack traces which include at least one function matching the given filter string. This is just a substring match and doesn't support wildcards or regexps.
* `-max-entries=<entries>`: This sets the number of stacks to include in the dump. The default is 10.
* `-percentage=<percent>`: If given all stacks are dumped, until the given percentage of the total allocation size is reached. If the `-sort-by-count` option is set, the percentage is now related to the allocation count.
* `-sort-by-count`: If given, the output is not sorted by allocation size, but by allocation count instead.
* `-internal-stats`: If given, some internal statistics are included at the end of the dump. This includes information like the memory used.

# Advanced topics

## Starting the malloc trace via VM options

A VM started with `-XX:+UseMallocHooks` can be instructed to start a malloc trace via command line options. This is especially useful if you want to trace allocations during the early phase.

To start the malloc trace use the `-XX:+MallocTraceAtStartup` option. By default this will directly enable the malloc trace as early as possible during the startup of the VM. The VM will exit if the trace could not be enabled. This can be changed via `-XX:-MallocTraceExitIfFail`.

 If you want to delay the startup of the trace, the `-XX:MallocTraceEnableDelay=<delay>`option is used. This enables the actual trace with the given delay. The delay can be given like *10s* for a ten second delay or *5m20s* for a 54 minutes and 20 second delay. It also supports *h* and *d* suffixes for hours and days.

After the trace has been started you can dump the allocated memory via `jcmd` as usual. If this is not possible, you can request timed dumps from the VM via the following JMV options:

* With `-XX:MallocTraceDumpInterval=<interval>`you can specify the delay between successive dumps. The format used is the same as in `-XX:MallocTraceEnableDelay`.
* With `-XX:MallocTraceDumpDelay=<delay>`you specify the initial delay for the first dump. `<delay>`is the delay after the trace was enabled. The format used is the same as in `-XX:MallocTraceEnableDelay`.
* The `-XX:MallocTraceDumpCount=<count>`specifies the number of dumps to do in total. The default is *0*.

Like with the `MallocTrace.enable` command from `jcmd`, the following options are available:

* Using `-XX:+MallocTraceTrackFree` the trace tracks the `free()` calls too, so you only get currently allocated memory when dumping the result.
* With `-XX:MallocTraceStackDepth=<depth>` you can change the maximum frames of the stack trace stored for each allocation. Larger values lead to more memory usage of the trace itself and increase the overhead somewhat.
* The `-XX:MallocTraceOnlyNth=<n-th>` flag makes the trace only track about every n'th allocation. This can be used to reduce the overhead of the trace.
* `-XX:+MallocTraceUseBacktrace`enables the use of `backtrace()/libunwind` for getting the stack trace. See the `-use-backtrace`option of the [`MallocTrace.enable`](#options-for-malloctraceenable) command for more details.
* If using libunwind for creating stacktraces, you can specify the name of the lib via `-XX:MallocTraceUnwindLibName=<name>`. The default name is `libunwind.so.8`.
* To collect some detailed statistics of the inner workings of the trace, use `-XX:+MallocTraceDetailedStats`.

To customize the output of the dumps, the following options can be used. They work like the equivalent options of the `MallocTrace.dump` command from `jcmd`:

* To sort by number of allocations instead of overall allocation size use `-XX:+MallocTraceDumpSortByCount`.
* To change the number of entries dumped from the default of 10 to `<count>` use `-XX:MallocTraceDumpMaxEntries=<count>`.
* If you want to limit the dumped entries to the top `<percent>` percent of allocation size or count (depending on the sorting), use `-XX:MallocTraceDumpPercentage=<percent>`.
* To change where the output is written to (be default it is *stderr*), use `-XX:MallocTraceDumpOutput=<destination>`. The destination can be "stderr" or "stdout" for output to *stderr* or *stdout*. Otherwise the destination is treated as a file with the given name. If the file contains "@pid", the first occurrence of that string is replaced by the process id of the VM.
* The `-XX:MallocTraceDumpFilter=<substring>` filters out stacks in which no function name contains the given substring.
* And finally `-XX:+MallocTraceDumpInternalStats` prints some additional internal statistics about the trace in each dump.

Using `-XX:+MallocTraceDumpOnError`enables the current trace to be dumped in case of a native out-of-memory error or an emergency dump from JFR. Since the dumping itself uses memory, a rainy day fund is allocated on startup if the option is enabled and is used during the dump. The size of the fund can be changed from the default of 1M via `-XX:MallocTraceRainyDayFund=<size>`.

## Using a custom launcher

The trace needs a library called `libmallochooks` to be preloaded at the start of the VM. This is usually done by the `java` launcher if given the `-XX:+UseMallocHooks` flag. If the VM is not launched via `java`, the launcher has to be started with the following environment variable set:

* For Linux: `LD_PRELOAD=<path-to-vm>/lib/libmallochooks.so`
* For MacOSX: `DYLD_INSERT_LIBRARIES=<path-to-vm>/lib/libmallochooks.dylib`
