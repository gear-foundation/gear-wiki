---
sidebar_label: Executable Functions
sidebar_position: 1
---

# Attention developers!

:::important
 Want to take your blockchain development skills to the next level? Join **[Gear Academy's](https://academy.gear-tech.io/)** free course, "Gear Smart Contract Developer." In this comprehensive course, you'll learn the ins and outs of developing on the Gear Protocol, from deploying programs onto the blockchain and interacting with them, to testing your programs on the Gear Network. You'll also gain hands-on experience navigating the `@gear-js` library for interacting with contracts on the client side and developing real-world applications, including contracts and frontends. Don't miss this opportunity to become a pro Gear blockchain developer. Enroll now in Gear Academy's **"[Gear Smart Contract Developer](https://academy.gear-tech.io/course/tamagotchi)"** course!
:::

## Executable functions, basic structure

The program is the main unit of the Gear Protocol. Each program in the Gear network is an immutable [Wasm](/docs/gear/technology/Wasm) blob and has a fixed amount of memory which persists between message handling (so-called static area).

Any program can contain up to 3 entry points that perform various functions in the program lifecycle: `init()`, `handle()`, `handle_reply()`. All of them are optional, but any program required to have at least one fn: `init()` or `handle()`.

Another special system entry point introduced by the Gear Protocol is `handle_signal()`. It allows the system to communicate with programs if it is necessary to notify (signal) that some event related to the program's messages has happened. For more details and examples, check the article about [System signals](./system-signals.md).

### init()

Optional `init()` function is called only once during program initialization and handles the incoming init payload if any.

```rust

#[no_mangle]
extern "C" fn init() {
    // execute this code during contract initialization
}

```

### handle()

The `handle()` function (also optional) will be called every time the program receives an incoming message. In this case, the payload will be processed.

```rust

#[no_mangle]
extern "C" fn handle() {
    // execute this code during explicitly incoming message
}

```

### handle_reply()

Processing the reply to the message in the Gear program is performed using the `handle_reply` function.

```rust

#[no_mangle]
extern "C" fn handle_reply() {
    // execute this code during handling reply on the previously sent message
}

```
