---
title: 持久化内存
sidebar_label: 持久化内存
sidebar_position: 4
---

Another distinguished feature of Gear Protocol is Persistent memory approach. It is what makes development easier, removes a lot of complexity and make protocol memory management match real-life hardware and operating systems.

Programs running in Gear Networks don’t use storage but rather their full state is persisted which ensures much less API surface for blockchain context. It avoids domain-specific language features as well as allows to use much more complex language constructs — persisted boxed closures, futures compositors, etc.

Gear Protocol uses clever memory virtualization techniques (despite vanilla Wasm does not), memory allocation and deallocation are first-class syscalls of the protocol. Memory access is also tracked and only required pages are loaded/stored. That allows heap-allocated stack frames of smart contracts stored in the blockchain’s state (typically found in futures and their compositors) to be seamlessly persisted and invoked when needed, preserving their state upon request.

Program code is stored as an immutable Wasm blob. Each program has a fixed amount of memory which persists between message-handling (so-called static area).

Gear instance holds individual memory space per program and guarantees it's persistence. A program can read and write only within its own memory space and has no access to the memory space of other programs. Individual memory space is reserved for a program during its initialization and does not require an additional fee (it is included in the program's initialization fee).

A program can allocate the required amount of memory in blocks of 64KB. Each memory block allocation requires a gas fee. Each page (64KB) is stored separately on the distributed database backend, but at the run time, Gear node constructs continuous runtime memory and allows programs to run on it without reloads.

# 内存并行

每个程序单独的独立内存空间允许 Gear 节点上的消息处理并行化。并行处理流的数量等于 CPU 核数。每个流处理用于一组已定义程序的消息。它涉及从其他程序或外部发送的消息 (用户事务)。

例如，给定一个消息队列，其中包含针对 100 个不同程序的消息，Gear 节点运行在一个配置了 2 个处理线程的网络上。Gear 引擎使用运行时定义的流数量 (等于一个典型的验证机上的 CPU 核的数量)，将目标程序的总数除以流的数量，并为每个流创建一个消息池 (每个流 50 个程序)。

程序被分发到不同的流中，每个消息出现在定义了目标程序的流中。因此，所有发给特定程序的消息都出现在一个处理流中。

在每个周期中，目标程序可以有多个消息，一个流处理大量程序的消息。消息处理的结果是来自每个流的一组新消息被添加到消息队列中，然后循环往复。在消息处理过程中生成的结果消息通常被发送到另一个地址 (返回原点或下一个程序)。

![alt text](/assets/message-parallelism.jpg)
