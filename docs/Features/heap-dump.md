---
title: "Additional Heap Dump Features"
sidebar_position: 5
slug: /heap-dump
---

{/* Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. */}

# Additional heap dump features

SapMachine includes some additional VM flags related to creating heap dumps.

## Allow overwriting the heap dump file created by `-XX:+HeapDumpOnOutOfMemoryError`

By default, when a heap dump is created via `-XX:+HeapDumpOnOutOfMemoryError`, the dumping
fails when the file already exists. This can be avoided with the `-XX:+HeapDumpOverwrite` VM flag.

## Allow dumping the heap to a special file like a tty or a named pipe

On a disk space limited system, dumping the heap to a tty or named pipe can be used to stream
the heap dump to another system, without needing local disk space.

E.g. if you can connect to a system via `ssh`, you can write
the heap dump to the tty device of the ssh connection and redirect the ssh output to a file
on the connecting machine.

Similarly, you could create a named pipe via `mkfifo` and dump the heap to this file. Then a program
like `nc` can be used to read from the named pipe and stream it via the network to another server.
Note that named pipes on Windows are not regular files and thus cannot be used as the destination
of a heap dump.

Since these types of files already exist, the `-XX:+HeapDumpOverwrite` flag must be set.

Starting from JDK 25, the heap dump is not written as a single file anymore. This would defeat
the purpose of writing to special files. It can be avoided via the `-XX:HeapDumpParallelism=1` VM flag.
This disables parallel heap dump writing and avoids using more than the specified file.

## Create smaller compressed heap dump files

Heap dumps can already be created in compressed gzip format (via `-XX:HeapDumpGzipLevel=1` for
dumps created by `-XX:+HeapDumpOnOutOfMemoryError` or with the `-gz` option for the `GC.heap_dump` jcmd).

If the dump is too large even after compression, the `-XX:+LimitPrimitiveArrayContentInHeapDump` can be
used to further decrease the size of the compressed heap dump. This is done by omitting the content of
large primitive arrays. More specifically, only the first 'N' elements of these arrays contain the real values
and the later values are replaced by `0` or `false` (for `boolean` arrays). This makes compression of
these arrays more efficient.

By default, only the first 120 elements of `char` and `byte` arrays are preserved with
`-XX:+LimitPrimitiveArrayContentInHeapDump` and the first 50 elements of the other primitive
arrays. The larger value for `char` and `byte` is used since these arrays often contain string
content we want to preserve (e.g. class names).

These default values can be changed with `-XX:StringLikeContentSizeLimitInHeapDump=<prefix-size>`
for `char` and `byte` arrays and with `-XX:ArrayContentSizeLimitInHeapDump=<prefix-size>` for
the other primitive array types.
