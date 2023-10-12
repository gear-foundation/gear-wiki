---
sidebar_position: 8
---

# Gas Reservation

Gas reservation is the powerful feature of Gear Protocol that enables the new approach to smart-contract programming and modern [use cases](../gear/distinctive-features).

Briefly, a program can send a message using gas that was reserved before instead of using gas from the currently processing message.

One of the key advantage of this feature is an ability of sending [messages delayed](./delayed-messages.md) in time automatically to any actor in the network - a user or another smart contract as well as to **itself**. In fact, a program is able to execute itself **unlimited** number of blocks (provided that enough gas for execution is kept available).

A program developer can provide a special function in the program's code which takes some defined amount of gas from the amount available for this program and reserves it. A reservation gets a unique identifier that can be used by a program to get this reserved gas and use it later.

To reserve the amount of gas for further usage use the [`ReservationId::reserve`](https://docs.gear.rs/gstd/struct.ReservationId.html#method.reserve) function:

```rust
let reservation_id = ReservationId::reserve(RESERVATION_AMOUNT, TIME)
    .expect("Reservation across executions");
```

You also have to indicate the block count within which the reserve must be used. Gas reservation is not free: the reservation for one block costs some gas. The `reserve` function returns [`ReservationId`](https://docs.gear.rs/gstd/struct.ReservationId.html), which one can use for sending a message with that gas. To send a message using the reserved gas:

```rust
msg::send_from_reservation(reservation_id, program, payload, value)
    .expect("Failed to send message from reservation");
```

If gas is not needed within the time specified during the reservation, it can be unreserved and the gas will be returned to the user who made the reservation.

```rust
id.unreserve().expect("Unreservation across executions");
```

Programs can have different executions, change state and evaluate somehow, but when it is necessary, a program can send a message with this reserved gas instead of using its own gas.

For example, let's consider the game that works completely on-chain. The players are smart contracts that compete with each other by implementing various playing strategies. Usually, in these types of games, there is a master contract that starts the game and controls the move order between the players.

To start the game, someone sends a message to the contract. The gas attached to this message is spent on the players' contracts, which in turn spend gas on their execution. Since the game can last quite a lot of rounds, the attached gas may not be enough to complete the game. You can send a message asking the program to continue the game, or you can use the gas reservation and make a fully automatic play.

Using gas reservation the contract will be able to hold the game without interruption.
