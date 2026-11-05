---
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.
title: "Essential Information on Virtual Threads"
sidebar_position: 13
slug: /essential-information-on-virtual-threads
---

# Essential Information on Virtual Threads

Virtual Threads are a new and exciting feature of Java. They promise performance and compatibility but there are also subtle differences to ordinary threads and even pitfalls which you should be aware of before making use of virtual threads in important systems.

On this page we collect and summarize essential information [referencing](#references) other sources for more details.

Being JDK and JVM developers we don't have own experience from building systems using virtual threads nevertheless we have gained knowledge [porting VM continuations in the hotspot VM to PPC](https://github.com/openjdk/jdk/pull/10961) and supporting SapMachine users in their endeavors with virtual threads.

## Virtual Threads are Evolving

Below it is indicated when certain characteristics of the implementation depend on JDK versions. New APIs are often introduced as [*preview features*](https://openjdk.org/jeps/12) with JDK releases. They are subject to change with every new JDK release. It is recommended to always use the latest preview version.

## When to Use Virtual Threads

Virtual threads are a means to scale up and keep CPUs busy while waiting for something (typically I/O).
Replacing *platform threads* with virtual threads alone will probably not improve the performance of the system. It is the scaling beyond the limited number of *platform threads* that will bring improvements in throughput.

So you should use virtual threads if your application:

* Does a significant amount of I/O.
  It might also help if there are waits for java.util.concurrent locks and conditions if they are not an obstacle themselves for scaling.

* Has at least 10,000 independent tasks at every point in time.

Vice versa, if your application is mostly doing computations, never waiting for input or if there are not that many independent tasks then you cannot expect improvements from virtual threads. In the former case (computation heavy) performance might even decrease. In the latter case it might be possible to refactor the application to create more independent tasks to get a speedup from virtual threads.

## How to Use Virtual Threads

It is recommended to start a new temporary virtual thread per request. This will work well as creation and start of virtual threads is extremely lightweight. It merely means allocating a few objects and calling the runnable.

With virtual threads you will be able to achieve a higher *throughput* of requests since you can have more virtual threads than *platform threads*.

You might also want to improve the *latency* of requests. You can make use of virtual threads for this too if handling a request involves independent I/O operations (e.g. querying other systems) or accessing *java.util.concurrent* data structures that might block. Executing the operations concurrently in new temporary virtual threads will reduce the latency of the request if the system is not yet fully loaded.
This comes at a cost though: stack traces of the temporary threads won't show the request context they are running in. This problem resembles the issues of asynchronous programming with callbacks. [*Structured Concurrency*](#structured-concurrency-5th-preview) can be used to keep the context information.

### Structured Concurrency (5th Preview)

When splitting a task into subtasks to be executed concurrently in virtual threads it is easy to make mistakes that can cause issues like leaks and you will lose the context (e.g. the request handled by the parent task) which complicates analysis of thread dumps. Since jdk 19 *ExecutorService* can be used in try-with-resources statements which is helpful but [*Structured Concurrency (5th Preview)*](https://openjdk.org/jeps/505) will go beyond. It imposes the static structure of code blocks on dynamically created subtasks thereby forming a tree which is used to control the life time of subtasks. The [structured can be observed](https://openjdk.org/jeps/505#Observability) in thread dumps when selecting json format.

### ThreadLocal vs Scoped Values (since JDK 25)

[Thread local values](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ThreadLocal.html) have design flaws that can have bigger impact with virtual threads (example is given [in the Virtual Threads documentation](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-68216B85-7B43-423E-91BA-11489B1ACA61)). [Scoped values](https://openjdk.org/jeps/506) are supposed to reduce complexity and improve security and performance. It is recommended to use scoped values instead of thread local values.

## What NOT to do

### Doing I/O while having a Java object locked

*The following is outdated since JDK 24.*

It is in general not optimal to hold a lock while doing I/O because I/O has significant latency which is added to the threads waiting for the lock. With virtual threads it is especially problematic because a virtual thread is *pinned* to its carrier thread while it has Java objects locked (see [limitations](#limitations-and-issues-to-be-aware-of)).

### Thread pools

A thread pool is the anti-pattern of how you should use virtual threads (see above). Creation and start of a virtual thread is (at least) an order of magnitude faster than creating a *platform thread* because it literally takes just few object allocations plus initialization to spin up a virtual thread. So the overhead of a pool is not amortized. Another issue with pooling could be that once GC has visited virtual threads (and their `StackChunks`) certain [fast paths are not available](https://github.com/openjdk/jdk21u-dev/blob/8fa8e02de980c51ab6793db6584a3e31ff59dd57/src/hotspot/share/oops/stackChunkOop.inline.hpp#L180) anymore. The [micro benchmark](#trivial-micro-benchmark) below demonstrates this.

### Busy waits

Busy waits are never preempted by the scheduler (see [limitations](#no-time-slice-based-preemption)). Busy waiting threads block their carrier threads, maybe even preventing another virtual thread from running and doing the work they are waiting for causing a dead lock.

### Long Calculations without Wait for I/O, Synchronization

The virtual thread scheduler does not preempt calculations so there is no value added by executing pure calculation tasks in virtual threads. After creating a couple of virtual threads for such tasks you won't be able to create more until prior tasks have completed. If a deadlock occurs might depend on the load of the system.

## Limitations and Issues to be Aware of

All relevant limitations are related to situations where a virtual thread cannot *unmount* from the *carrier*.

If this is due to locking of a Java object monitor or due to JNI then the virtual thread is said to be *pinned*. In this case the scheduler **will not compensate**, in all other cases it **will compensate** for the blocked *carrier* by temporarily adding a new one to the pool (see also section ["Executing virtual threads" in JEP 444](https://openjdk.org/jeps/444))

The limitations can become bottlenecks and cause even deadlocks if all *carriers* are occupied by threads that don't *unmount*. How severely your application is affected will also depend on the load so it is advisable to conduct stress tests under high load.

### Pinned: Java Object Monitor (*synchronized* Statement)

**Fixed since JDK 24 by [JEP 491: Synchronize Virtual Threads without Pinning](https://openjdk.org/jeps/491)**

A thread is *pinned* if a thread is executing inside a *synchronized* block or method or if it is waiting to enter a *synchronized* block or method.

Should this become an issue it is recommended to replace the synchronization with classes from [*java.util.concurrent*](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html) if possible.

Work has been done to overcome this limitation. It is still experimental but you can test drive [early access builds](https://jdk.java.net/loom/) of it.

### Pinned: JNI

Active JNI calls *pin* a virtual thread to its *carrier*. The associated native frames are not under control of the vm and therefore cannot be relocated which is required for *mounting* and *unmounting*.

### Pinned: Class Initialization

**Fixed(*) since JDK 26 by [8369238](https://bugs.openjdk.org/browse/JDK-8369238): Allow virtual thread preemption on some common class initialization paths**

A class needs to be initialized before it can be used. The initialization code is defined in a special *static block* which is called implicitly by the vm just-in-time when a thread makes use of a reference to a class in a static field access, method call or if a new instance is created. The call is performed within the context of the thread that is using the reference. In the case of a virtual thread it will be pinned for the duration of the call. Other threads referencing the same class are blocked until initialization has completed. Blocked virtual threads are again pinned.

[TestClassInit.java](https://github.com/reinrich/experiments/blob/main/vthreads/clinit/TestClassInit.java) demonstrates the deadlock. The thread dump shows [thread #29 blocked executing the class initializer](https://github.com/reinrich/experiments/blob/e056cb8617750cd3e1d013afca1041a26906ee4a/vthreads/clinit/TestClassInit_thread_dump.txt#L95) ("&lt;clinit&gt;"). Many other [threads are blocked waiting for class initialization to complete](https://github.com/reinrich/experiments/blob/e056cb8617750cd3e1d013afca1041a26906ee4a/vthreads/clinit/TestClassInit_thread_dump.txt#L100-L143). Thread #29 waits for the unmounted thread #27 which cannot return from its sleep because the threads aforementioned are pinned occupying all carriers.

(*) In extremely unlikely cases the deadlock can still occur. This requires that the class reference is made from a c1 jitted method. This is so unlikely because normally bytecode is only jitted after it has been executed at least a couple of times. And first execution causes initialization of the referenced class.

### *Object::wait* and Other 'Compensating' Operations

**Fixed since JDK 24 by [JEP 491: Synchronize Virtual Threads without Pinning](https://openjdk.org/jeps/491)**

A virtual thread blocked in *Object::wait* cannot unmout. The scheduler compensates for this by adding a temporary *carrier* to the pool if needed (see [*Object::wait*](https://github.com/openjdk/jdk/blob/0b9350e8b619bc556f36652cde6f73211be5b85b/src/java.base/share/classes/java/lang/Object.java#L373) and [*Block::begin*](https://github.com/openjdk/jdk/blob/0b9350e8b619bc556f36652cde6f73211be5b85b/src/java.base/share/classes/jdk/internal/misc/Blocker.java#L74)).

It is rather common that a larger number of threads are blocked in *Object::wait* to be *notified* about an event. These cases need the compensation to avoid deadlocks. In contrast to that it is uncommon that many threads are blocked in the attempt to enter a synchronized block or method as it would prevent scaling. So the compensation is not needed. At least in most cases it is not needed. There may be exceptional situations where many threads are blocked waiting to enter a *synchronized* block. These are problematic and can cause deadlocks.

[Early access builds](https://jdk.java.net/loom/) contain [experimental work](https://github.com/openjdk/loom/commit/756743dae93f07029cba3362c0ec66f7bc7c1a61) that allows to unmount a virtual thread when it calls *Object::wait*.

There are other operations handled likewise. Most of them are related to file I/O (filesystems rarely support asynchronous I/O).

### *java.util.concurrent* Synchronizers and Locks

Locks in [*java.util.concurrent.lock*](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/package-summary.html) might cause issues with the order that threads are notified when a lock becomes available.

If, e.g., virtual threads v1 and v2 are waiting for a lock that is released and v1 is notified instead of v2 which is pinned to its carrier then this can lead to a deadlock if no *carrier* is available for v1.

### No Time Slice Based Preemption

The scheduler does not preempt virtual threads based on CPU time consumption. This can become an issue if there are too many virtual threads doing
long computations.

## Porting Existing Applications and Libraries to Virtual Threads

Due to the compatibility of the new APIs (e.g. `VirtualThread` is a subclass of `java.lang.Thread`), the initial effort might be not too high to change an existing application to make use of virtual threads.

Though chances are, especially with JDK 21, that under real load you face deadlock issues caused by the [limitations](#limitations-and-issues-to-be-aware-of) of that version. JDK 25, the most recent LTS version, eliminates problems related to synchronization but still suffers from other limitations. So thorough load testing before release is crucial.

Also it is not unlikely that the existing application requires several tuning cycles before you see performance improvements you hope for if there are bottlenecks that where not yet triggered because of the the limits of *platform threads*.

## Trivial Micro Benchmark

A [TrivialVthreadMicroBenchmark](https://github.com/reinrich/experiments/blob/main/vthreads/benchmark/TrivialVthreadMicroBenchmark.java) demonstrates some of the claims given here.

* Virtual threads [start up much faster](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L26)

* There can be much more [virtual threads](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L57) than [*platform threads*](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L19)

* Pooling [*platform threads*](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L131) is needed and not needed with [virtual threads](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L130)

* [Better performance](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L44-L45) with virtual threads than with *platform threads*.
  First guess would be: better cache performance when using the stack memory of the few carrier threads.

* With thousands of *platform threads* it takes [extremely long until the process has terminated](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L47)

* [100K virtual threads](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L86-L87) are faster than [30K *platform threads*](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L44-L45)

* [Slowdown](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L86-L87) if GC has visited the virtual threads

* The benchmark [uses *java.util.concurrent* synchronization](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/benchmark/TrivialVthreadMicroBenchmark.java#L109-L112) to avoid issues of java monitors if used with virtual threads.
  If you want you can try to write an alternative implementation of *CountDownLatch* that is based on java monitors (i.e. *synchronized*). The benchmark will deadlock then because calling *Object::wait()* will *pin* the virtual thread.

## Configuration

### jdk.virtualThreadScheduler.parallelism

Property to control the number of *carrier threads* in the pool. By default set to `Runtime.getRuntime().availableProcessors()`.

### jdk.virtualThreadScheduler.maxPoolSize

Property to control the maximum number of *carrier threads* in the pool. By default set to 256.

### jdk.virtualThreadScheduler.minRunnable

Property to control when to temporarily add *carrier threads* to the pool. By default set to the maximum of 1 and *parallelism* / 2. If less *carrier threads* are available for execution of virtual threads, then the number of *carriers* may temporarily increase. This can improve throughput but starting a new platform thread also means overhead.

Refer to [limitations](#limitations-and-issues-to-be-aware-of) for conditions where *carrier threads* are temporarily added to the pool

## Observing Virtual Threads

### Stack Dumps

Only the *jcmd* command *Thread.dump_to_file* will show the stacks of virtual threads.

The *carrier threads* are normally from a ForkJoin thread pool with the name prefix "ForkJoinPool-1".

### Example: Virtual Threads Pinned with JDK 21 due to Synchronization

*NOTE:* JDK 25 does not suffer anymore from the issues described below.

In this [example](https://github.com/reinrich/experiments/blob/main/vthreads/locking_stackdump/out_synchronized.txt) *carrier threads* that have a virtual thread mounted have stacks with the following frames on top

```text
java.base/jdk.internal.vm.Continuation.run(Continuation.java:248)
java.base/java.lang.VirtualThread.runContinuation(VirtualThread.java:221)
```

The *carriers* are blocked running virtual threads. From looking at their stacks it is not possible to say what the virtual threads are doing. In the example all virtual threads are either waiting to start or [blocked waiting for a Java object monitor](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/locking_stackdump/VTReentrantLockExample.java#L37) *pinned* to their *carrier* except for one thread that owns the monitor and executes the method [`consumeCPU()`](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/locking_stackdump/VTReentrantLockExample.java#L63). Note that the *pinning* is the bottleneck that prevented all but 4 virtual threads from starting. 4 threads could be started because 4 carrier threads were configured using the property *jdk.virtualThreadScheduler.parallelism*

*Pinning* can be avoided by using a [*java.util.concurrent.locks.ReentrantLock*](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/locking_stackdump/VTReentrantLockExample.java#L47). All threads were able to start because when blocking on the lock the threads unmount from their *carrier*. Now only [one *carrier* has a virtual thread mounted](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/locking_stackdump/out_reentrantlocks.txt#L70). [Others are waiting](https://github.com/reinrich/experiments/blob/bd69b958ab89b13e41881242955eca64fb2144ac/vthreads/locking_stackdump/out_reentrantlocks.txt#L82) for a virtual thread to become runnable.

If you select `-format=json` then tasks created with the *Structured Concurrent API* will be grouped according to the scopes (an example is given [in the Structured Concurrency documentation](https://docs.oracle.com/en/java/javase/21/core/structured-concurrency.html#GUID-2EF450F4-58CA-4D30-AF86-8AAB92B2AD16))

### Tracing

By setting *jdk.tracePinnedThreads* you will get a stack trace if a virtual thread cannot be *unmounted* because it is pinned. For a shorter trace you can specify *-Djdk.tracePinnedThreads=short*. Each stack will be printed at most once.

### JFR

There are a bunch of events related to virtual threads.

* [VirtualThreadStart](https://sap.github.io/jfrevents/21.html#virtualthreadstart)
* [VirtualThreadEnd](https://sap.github.io/jfrevents/21.html#virtualthreadend)
* [VirtualThreadPinned](https://sap.github.io/jfrevents/21.html#virtualthreadpinned)
* [VirtualThreadSubmitFailed](https://sap.github.io/jfrevents/21.html#virtualthreadsubmitfailed)

## Debugging

Virtual threads are hidden by default when debugging. You don't see them and they don't stop at breakpoints. You can change this behavior when launching your application. One way to do this is to pass the option `includevirtualthreads=y` to the JDWP agent.

### Example

```sh
java -agentlib:jdwp=transport=dt_socket,address=8000,server=y,suspend=n,includevirtualthreads=y Example.java
```

One reason for hiding virtual threads is that stopping at a breakpoint pins the virtual thread. If to many threads hit the breakpoint this will deadlock the vm.

Local variables in virtual threads can currently only be changed in the topmost frame.

## Glossary

### Carrier Thread

A *Platform thread* that the scheduler uses to *mount* a virtual thread for execution. The scheduler *unmounts* the virtual thread if an operation blocks unless the virtual thread is *pinned* or *unmounting* is not possible with the operation (see [limitations](#limitations-and-issues-to-be-aware-of)).

### Mounting and Unmounting a Virtual Thread

*Mounting*/*unmounting* is effectively switching context between *carrier* and virtual thread. The switching is done in user mode.

A *carrier* is blocked while a virtual thread is *mounted*. A virtual thread is blocked while *unmounted*.

### Pinned

A virtual thread is said to be *pinned* to its *carrier thread* if

* it is executing in a *synchronized* method or block
  (fixed since JDK 24 by [JEP 491](https://openjdk.org/jeps/491))
* waiting to enter a *synchronized* method or block
  (fixed since JDK 24 by [JEP 491](https://openjdk.org/jeps/491))
* or has a JNI call on stack.

The virtual thread cannot *unmount* when executing a blocking operation while *pinned*, i.e. it blocks its *carrier*.
The scheduler does not compensate for this (see [limitations](#limitations-and-issues-to-be-aware-of)).

### Platform Thread

A Java thread that is not a virtual thread. It is mapped to a dedicated OS thread for execution. The mapping is never modified.

### Virtual Thread

A Java thread handled entirely by the Java runtime in user mode. For execution it is *mounted* on a *carrier thread*. It is lightweight compared to *platform threads*. It can be created faster, it consumes less memory, it executes as fast as platform threads, and there can be many more virtual than platform threads.

## References

### JEP 444: Virtual Threads

https://openjdk.org/jeps/444

### JEP 462: Structured Concurrency (5th Preview)

https://openjdk.org/jeps/505

### JEP 464: Scoped Values (since JDK 25)

https://openjdk.org/jeps/506

### JDK 21 Documentation: Java Core Libraries, Concurrency

Covers *Virtual Threads*, *Structured Concurrency*, and *Thread-Local Variables*.
https://docs.oracle.com/en/java/javase/21/core/concurrency.html

### JDK 25 Documentation: Java Core Libraries, Concurrency

Covers *Virtual Threads*, *Structured Concurrency*, and *Thread-Local Variables*.
https://docs.oracle.com/en/java/javase/25/core/concurrency.html

### JDK 25 API Documentation: ScopedValue

Covers the class *java.lang.ScopedValue*.
https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html
