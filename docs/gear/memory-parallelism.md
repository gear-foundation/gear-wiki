---
sidebar_label: 'Memory Parallelism'
sidebar_position: 5
---

# Memory parallelism

Individual isolated memory space per program allows parallelization of message processing on a Gear node. Number of parallel processing streams equals the number of CPU cores. Each stream processes messages intended for a defined set of programs. It relates to messages sent from other programs or from outside (user’s transactions).

For example, given a message queue containing messages targeted to 100 different programs, Gear node runs on a network where 2 threads of processing are configured. Gear engine uses a runtime-defined number of streams (equal to number of CPU cores on a typical validator machine), divides total amount of targeted programs to number of streams and creates a message pool for each stream (50 programs per stream).

Programs are distributed to separate streams and each message appears in a stream where its targeted program is defined. So, all messages addressed to a particular program appear in a single processing stream.

In each cycle a targeted program can have more than one message and one stream processes messages for plenty of programs. The result of message processing is a set of new messages from each stream that is added to the message queue, then the cycle repeats. The resultant messages generated during message processing are usually sent to another address (return to origin or to the next program).

![alt text](/assets/message-parallelism.jpg)