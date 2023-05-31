---
sidebar_label: Introduction
sidebar_position: 1
---

# Attention developers!

:::important
 Want to take your blockchain development skills to the next level? Join **[Gear Academy's](https://academy.gear.foundation/)** free course, "Gear Smart Contract Developer." In this comprehensive course, you'll learn the ins and outs of developing on the Gear Protocol, from deploying programs onto the blockchain and interacting with them, to testing your programs on the Gear Network. You'll also gain hands-on experience navigating the `@gear-js` library for interacting with contracts on the client side and developing real-world applications, including contracts and frontends. Don't miss this opportunity to become a pro Gear blockchain developer. Enroll now in Gear Academy's **"[Gear Smart Contract Developer](https://academy.gear.foundation/course/tamagotchi)"** course!
:::

## What is a Gear smart contract?

Gear smart contract a just a program that runs on the Gear Protocol. It is a piece of code compiled to Wasm that is deployed to the blockchain and can be executed by anyone who sends a message to it. The program can store data, receive and send messages, and perform any other actions that are allowed by the Gear Protocol.

Every program should have a set of exported functions that can be called by the Gear Protocol. These functions are called entry points. The Gear Protocol has a set of predefined entry points that are used to initialize the program, handle incoming messages, and process replies to previously sent messages.

But we can't implement any business logic without using imported functions that form the API for the program. The Gear Protocol has a set of predefined API functions that can be used by any program. There are low-level functions that allow us to load incoming message's payload, send messages, and perform other actions. And there are higher-level libraries that allow us to interact with the Gear Protocol in a more convenient way.

## Predefined entry points (exported functions)

The central exported function of the Gear smart contract is `handle()`. It is called every time the program receives an incoming message. Below is the Rust example code:

```rust
#[no_mangle]
extern "C" fn handle() {
    // Execute this code during explicitly incoming message
}
```

This function is obligatory to be defined in the program.

In this function, we are to define the main business logic of our program. For example, we can check the incoming message and perform some actions depending on the message type. Also, we can send a message to another program. Finally, we can send a reply to the message that was received by the program.

As with any other program intended to be executed in some environment, Gear smart contract has its own lifecycle. It is initialized, receives messages, and can be terminated. We are to define the optional `init()` function if we want to perform some actions during the initialization of the program. For example, we can store some data in the program's memory. The `init()` function is called only once during the program initialization.

```rust
#[no_mangle]
extern "C" fn init() {
    // Execute this code during contract initialization
}
```

If there is no `init()` function in the program, the program will be initialized without any custom actions.

And the third most important function is `handle_reply()`. It is called when the program receives a reply to the message that was sent by the program. For example, we can check the reply and perform some actions depending on the reply type.

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    // Execute this code during handling reply on the previously sent message
}
```

There is no need to define the `handle_reply()` function if the program doesn't intend to receive replies. In this case, the program will ignore all incoming replies.

The reply message is similar to the ordinary message, but it has some differences:

- The reply message is sent to the user or program that has sent the original message. We can't set the destination of the reply message explicitly.
- We can send only one reply message per execution. We get an error if we try to send more than one reply message.
- Even if the program execution is failed (for example, panic is called or the gas limit is exceeded), the reply message will be sent anyway.
- The reply message is processed in `handle_reply()` function instead of `handle()` function for the ordinary message. We have mentioned this above but it is worth to underline it again.

## API functions (imported functions)

There are a lot of imported functions that can be used by the Gear smart contract. They are called API functions. These functions are provided by the runtime that executes the Gear smart contract. The most convenient way to use these functions is to use the Gear standard library called [`gstd`](https://docs.gear.rs/gstd/). It is a set of high-level functions that are implemented on top of the low-level API functions.

## Basic stages of the Gear smart contract lifecycle

Let's explore the typical lifecycle of a Gear smart contract. We will use the Rust programming language for the examples, but the same principles are applied to any other language that can be compiled into Wasm.

**Step 1.** Write the program code.

You can find the minimal example in the [Getting Started](/docs/getting-started/5-minutes) section. It is a simple program that stores the counter, can increment and decrement it, and return the current value of the counter.

More advanced examples can be found in the Gear dApps organization on GitHub: https://github.com/gear-dapps

**Step 2.** Compile the program into Wasm.