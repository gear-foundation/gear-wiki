---
sidebar_position: 7
---

# Gas reservation

Gas reservation is the powerful feature of Gear Protocol that enables the new approach to smart-contract programming and modern [use cases](../gear/distinctive-features).

Briefly, it allows sending messages using reserved gas from the initial message instead of using gas from the last sent message.

A program developer can provide a special function in the program's code which takes some defined amount of gas from the amount available for this program and reserves it. A reservation gets a unique identifier that can be used by a program to get this reserved gas and use it later. Programs can have different executions, change state and evaluate somehow, but when it is necessary, a program can send a message with this reserved gas instead of using its own gas.

For example, let's consider some arbitrary game implementation. A user starts a game (sends a message to a program) and a program reserves some amount of gas from this message. Then other actors start sending messages to the program (registration of participation in the game). Once all is done (by timeout or number of participants threshold reached), a program sends a final message automatically (the game results) using reserved gas without the need for the user to manually interact with the program. It allows the program not to hang in the waitlist waiting for a reply and spending gas (being in the whitelist consumes gas every block). In this example, synchronous implementation can be more effective from the gas consumption perspective.
