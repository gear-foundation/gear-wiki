---
sidebar_position: 5
sidebar_label: Pay Program rent
sidebar_class_name: hidden
---

To pay program rent, use the following JavaScript code:

```javascript

// program.payRent has params:
// programId
// blockCount - number of blocks for which we want to extend
const tx = await api.program.payRent('0x...', 100_000);

tx.signAndSend(account, (events) => {
   events.forEach(({ event }) => console.log(event.toHuman()));
});

```

You can calculate the current rent price using the following code:

```javascript

const price = api.program.calculatePayRent(blockCount);

```

If a program was paused and its pages removed from storage, you can restore it using the `api.program.resumeSession` methods:

- `init`: Start a new session to resume the program.
- `push`: Push a bunch of program pages.
- `commit`: Finish the resume session.

Here's how you can resume a paused program:

```javascript

const program = await api.programStorage.getProgram(programId, oneBlockBeforePauseHash);
const initTx = api.program.resumeSession.init({
  programId,
  allocations: program.allocations,
  codeHash: program.codeHash.toHex(),
});

let sessionId;
initTx.signAndSend(account, ({ events }) => {
  events.forEach(({ event: { method, data } }) => {
    if (method === 'ProgramResumeSessionStarted') {
      sessionId = data.sessionId.toNumber();
    }
  });
});

const pages = await api.programStorage.getProgramPages(programId, program, oneBlockBeforePauseHash);
for (const memPage of Object.entries(page)) {
  const tx = api.program.resumeSession.push({ sessionId, memoryPages: [memPage] });
  tx.signAndSend(account);
}

const tx = api.program.resumeSession.commit({ sessionId, blockCount: 20_000 });
tx.signAndSend(account);

```
