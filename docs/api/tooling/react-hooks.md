---
sidebar_position: 2
sidebar_label: React-hooks
---

# Gear React-hooks

Hooks allow functional components to have access to programs running on Gear networks and significantly simplify the development of front-end applications.

## Installation

```sh
npm install @gear-js/react-hooks
```

or

```sh
yarn add @gear-js/react-hooks
```

## Getting started

Simple as it is, here's quick example:

```jsx
import { useReadFullState } from '@gear-js/react-hooks';
import { useMetadata } from './use-metadata'

import meta from 'assets/meta/meta.txt';

function State() {
  const programId = '0x01';
  const { metadata } = useMetadata(meta);

  const { state } = useReadFullState(programId, meta);

  return <div>{JSON.stringify(state)}</div>;
}

export { State };
```

## Cookbook

:::info
In order for these hooks to work, the applicatoin must be wrapped in the appropriate Providers. As it is presented in the [example](https://github.com/gear-tech/gear-js/blob/main/utils/create-gear-app/gear-app-template/template/src/hocs/index.tsx). If you use `cga`, then all the necessary environment has already been provided.
:::

### useApi

`useApi` provides access to the Gear API connected to the selected PRC-node.

```js
import { useApi } from '@gear-js/react-hooks';

const { api, isApiReady } = useApi();
```

### useAccount

`useAccount` provides interaction with `Polkadot-js` extension api, allows to manage accounts from it (for example to sign transaction).

```js
import { useAccount } from '@gear-js/react-hooks';

const { account, isAccountReady } = useApi();
```

### useAlert

`useAlert` shows any alert in the application context.

```js
import { useAlert } from '@gear-js/react-hooks';

const alert = useAlert();

// type?: 'info' | 'error' | 'loading' | 'success';
alert.success('success message')
```

### useMetadata

This hook is auxiliary and it is not pre-installed in the react-hook library. `useMetadata` allows to convert program's metadata (`.txt` file) into the required format.

```js
import { useEffect, useState } from 'react';
import {
  getProgramMetadata,
  ProgramMetadata
} from '@gear-js/api';
import { Buffer } from 'buffer';

export const useMetadata = (source: RequestInfo | URL) => {
  const [data, setData] = useState<ProgramMetadata>();

  useEffect(() => {
    fetch(source)
      .then((res) => res.text())
      .then((raw) => getProgramMetadata(`0x${raw}`))
      .then((meta) => setData(meta));
  }, [source]);

  return { metadata: data };
};
```

### useWasmMetadata

This hook is auxiliary and it is not pre-installed in the react-hook library. `useWasmMetadata` allows getting Buffer array from the program `meta.wasm`. Buffer is required always when using custom functions to query specific parts of the program State.

```js
import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';

export const useWasmMetadata = (source: RequestInfo | URL) => {

  const [data, setData] = useState<Buffer>();

  useEffect(() => {
    if (source) {
      fetch(source)
        .then((response) => response.arrayBuffer())
        .then((array) => Buffer.from(array))
        .then((buffer) => setData(buffer))
        .catch(({ message }: Error) => console.error(`Fetch error: ${message}`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  return { buffer: data };
};
```

### useSendMessage

`useSendMessage` allows sending messages to the program.

```js
import { useSendMessage } from '@gear-js/react-hooks';
import { useMetadata } from './useMetadata';
import meta from 'assets/meta/meta.txt';

function sendMessage() {
  const programId = '0x01';
  const { metadata } = useMetadata(meta);

  return useSendMessage(programId, metadata);
}
```

### useReadFullState

`useReadFullState` allows reading full program State.

```js
import { useReadFullState } from '@gear-js/react-hooks';
import { useMetadata } from './useMetadata';
import meta from 'assets/meta/meta.txt';

function readFullState() {
  const programId = '0x01';
  const { metadata } = useMetadata(meta);

  const { state } = useReadFullState(programId, metadata);

  return state;
}
```

### useReadWasmState

`useReadWasmState` allows reading program State using specific functions.

```js
import { useReadWasmState } from '@gear-js/react-hooks';
import { useWasmMetadata } from './useMetadata';
import stateMetaWasm from 'assets/wasm/state.meta.wasm';

function useProgramState<T>(functionName: string, payload?: any) {
  const programId = '0x01';
  const { buffer } = useWasmMetadata(stateMetaWasm);

  return useReadWasmState<T>(
    programId,
    buffer,
    functionName,
    payload,
  );
}

function firstState() {
  const payload = 'some_payload'
  const { state } = useProgramState('foo_1', payload);
  return state;
}

function secondState() {
  // if program state function doesn't have initial payload
  const { state } = useProgramState('foo_2', null);
  return state;
}
```

### useCreateHandler

`useCreateHandler` provides a tool for uploading the Gear program to the chain.

```js
import { useCreateHandler } from '@gear-js/react-hooks';
import meta from 'assets/meta/meta.txt';
import { useMetadata } from './useMetadata';

export function useCreateProgram(onSuccess: (programId: Hex) => void) {
  const codeHash = '0x01';
  const { metadata } = useMetadata(meta);
  const createProgram = useCreateHandler(codeHash, meta);

  return (payload) => createProgram(payload, { onSuccess });
}
```
