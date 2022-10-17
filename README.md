# @rlean/core

The purpose of this package is to remove the boilerplate code that becomes unruly when working in enterprise level React applications. This package handles the state, storage, middleware, API calls, and suggests structure and implementation in the Web app. There is no need for smart components or dumb components, only functional components. All global state objects have entities. Entities are configured with properties that tells this package how to handle the behavior of that object, and the state for that object can be managed by invoking any of the package's custom hooks and functions: useGet, usePost, usePut, usePatch, useDelete, useSave, useRemove, and removeAll.

## Getting Started

### Installing

It's recommended that you begin with a copy of the [boilerplate template](https://github.com/tommyers-dev/rlean_boilerplate) rather than starting with a new installation, but if you'd prefer to install in an existing project using your preferred structure, follow these steps:

`npm i @rlean/core --save`

Create a **entities** folder somewhere in your app. In the [boilerplate template](https://github.com/tommyers-dev/rlean_boilerplate), that's located at **lib/entities**. Make sure this folder contain an index.js file to export all entities.

Add a configuration file that will be used when initializing the @rlean/core package. In the [boilerplate template](https://github.com/tommyers-dev/rlean_boilerplate), that's located at **config/rLean.js**.

Example configuration:

> Note: logToConsole is set to true for the example. A better approach would be to set it to something like `logToConsole: process.env.REACT_APP_ENV !== 'production'` so your global state is not visible to your end users in the console.  
> Also, getToken() needs to handle token refreshes for your application.

```js
import * as entities from "lib/entities";
import { getToken } from "config";

export const rLean = {
  entities,
  api: {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    uri: process.env.REACT_APP_API_URI,
  },
  logToConsole: true,
};
```

In the index.js file at the root of the project, include the following imports:

```js
import { RLean, StateProvider } from "@rlean/core";
import { rLean as config } from "config";
```

Initialize the @rlean/core package:

```js
RLean.init(config);
```

And wrap the App component in the StateProvider:

```js
ReactDom.render(
  <StateProvider>
    <App />
  </StateProvider>
);
```

If you are using typescript, the StateProvider should be typed like this:

```ts
ReactDom.render(
  <StateProvider<typeof config.entities>>
    <App />
  </StateProvider>
);
```

That's it! Now you can start using @rlean/core functions within the project. If you want to take advantage of the benefits of typescript, checkout the hooks section and the definition of entities in this guide. For a working example of the configuration above, please refer to the [boilerplate template](https://github.com/tommyers-dev/rlean_boilerplate) on github.

### Recommended structure

Please see the [boilerplate template](https://github.com/tommyers-dev/rlean_boilerplate) project on github for a working example of the recommened structure.

## Adapters

This framework uses Axios for API calls and localForage for storage by default. These can be overridden by including your own custom adapters in lib/adapters and including these in your configuration file:

```js
import * as entities from "lib/entities";
import { ApiAdapter, StorageAdapter } from "lib/adapters";
import { getToken } from "config";

export const rLean = {
  entities,
  api: {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    uri: process.env.REACT_APP_API_URI,
    adapter: ApiAdapter,
  },
  storage: {
    adapter: StorageAdapter,
  },
  logToConsole: true,
};
```

An API adapter should have the following structure. Any unnecessary methods can be omitted.

```ts
import { ApiAdapter as ApiInterface } from "@rlean/core";

class ApiAdapter extends ApiInterface {
  async get(apiPayload) {
    const { url } = apiPayload;
    // fetch data
    // return response
  }

  async post(apiPayload) {
    const { url, data } = apiPayload;
    // fetch data
    // return response
  }

  async put(apiPayload) {
    const { url, data } = apiPayload;
    // fetch data
    // return response
  }

  async patch(apiPayload) {
    const { url, data } = apiPayload;
    // fetch data
    // return response
  }

  async del(apiPayload) {
    const { url, data } = apiPayload;
    // fetch data
    // return response
  }
}

export default new AxiosAdapter();
```

A storage adapter should have the following structure. All functions are required.

```js
class StorageAdapter {
  async set(key, value) {
    if (!key || value === undefined) {
      throw new Error("Key or value cannot be undefined");
    }

    // setItem
  }

  async get(key) {
    if (!key) throw new Error("Must supply a key in get");

    // return getItem
  }

  async clear() {
    // clear
  }

  async remove(key) {
    if (!key) throw new Error("Must supply a key in remove");

    // removeItem
  }
}

export default new StorageAdapter();
```

## Using Entities and its functions and attributes

This is an example of an entity that doesn't get populated from an API call. initialState, types, reducer, and updateState can be omitted and the following will be autogenerated by rlean/core.

```ts
import { define } from "@rlean/core";

export type EntityType = {
  id: string;
  attr: string;
};

const Entity = define<EntityType>("entityName");
```

To populate this model from an API call, include the following in options:

```ts
const Entity = define<EntityType>("entityName", {
  getURL: "/apiPath",
});
```

If this API call includes path params, set the getURL accordingly.

```js
const DemoEntity = define("demoEntity", {
  getURL: "/SomeApiPath/:id",
});
```

If query string params will be used, don't include them in the attribute. The query string params will be built out for you based on what is provided as params when using the useGet custom hook.

### Entity define options

The define function has two required parameters, the key of the entity and its options. This is their definitions:

```ts
type EntityDefineOptions<T> = {
  key: string;
  initialState?: Partial<T>;
  getURL?: string;
  postURL?: string;
  putURL?: string;
  patchURL?: string;
  deleteURL?: string;
  nullableParams?: boolean;
  persistData?: boolean;
  preferStore?: boolean;
  progressiveLoading?: boolean;
  syncInterval?: number;
  syncAfterTimeElapsed?: boolean;
  apiUriOverride?: string;
  adapters?: Adapter;
  queueOffline?: boolean;
  type?: string;
  updateState?: Function;
  reducer?: Function;
  includeInState?: boolean;
  listener?: Function;
  extensions?: any;
};

const define = <T>(
  key: string,
  options: Partial<EntityDefineOptions<T>>,
  callback?: Function
): EntityDefineOptions<T>;
```

All attributes are optional, but some are needed to get some functionalities. Specifically, if the entity is to be connected to an API, the URLs options are needed. See bellow for more details.

### Entity props

The following props can be added to customize your entity's behavior.

```js
const DemoEntity = define("demoEntity", {
  initialState: {},
});
```

`postURL` is the path that will be used when the entity instance is passed in post.

```js
const DemoEntity = define("demoEntity", {
  postURL: "/SomeApiPath",
});
```

`putURL` is the path that will be used when the entity instance is passed in put.

```js
const DemoEntity = define("demoEntity", {
  putURL: "/SomeApiPath",
});
```

`deleteURL` is the path that will be used when the entity instance is passed in del.

```js
const DemoEntity = define("demoEntity", {
  deleteURL: "/SomeApiPath",
});
```

`patchURL` is the path that will be used when the entity instance is passed in patch.

```js
const DemoEntity = define("demoEntity", {
  patchURL: "/SomeApiPath",
});
```

`nullableParams` is false by default. If an optional param is not needed by the web app, simply omit it. the purpose of this attribute is to prevent unnecessary calls to the API before the param objects have been initialized. This is available as an override in case null is a valid value for a param. This cannot be set for individual params, but rather at the entity level.

```js
const DemoEntity = define("demoEntity", {
  getURL: "/SomeApiPath",
  postURL: "/SomeApiPath",
  nullableParams: true,
});
```

If `persistData` is false, data isn't stored to storage. Api is called every time. This will override `preferStore` (because there's no stored value). This is true by default.

```js
const DemoEntity = define("demoEntity", {
  getURL: "/SomeApiPath",
  persistData: false,
});
```

If `preferStore` is true, it will rely on storage instead of calling the API repeatedly. This will override `progressiveLoading`.

```js
const DemoEntity = define("demoEntity", {
  getURL: "/SomeApiPath",
  preferStore: true,
});
```

### Entity Functions

These are the default functions if they are omitted. The updateState function is your action. This is what will be called to update your object in state. Type is not needed if there is only one type in your entity.

```js
const DemoEntity = define('demoEntity', {
  getURL: '/SomeApiPath',
  reducer: (state, action) => {
    switch (action.type) {
      case 'SET_DEMO_ENTITY:
        return {
          ...state,
          ...action.demoEntity
        };

      default:
        return state;
    }
  },
  updateState: (demoEntity, type) {
    return {
      type,
      demoEntity
    }
  }
});
```

If using the optional type to update a part of the object in state instead of the entire object, just use a switch statement in updateState like in the reducer, and pass the type as a parameter in useGet, save, remove, post, put, patch, and del.

## Custom hooks and functions

### useGlobalState

Use the useGlobalState custom hook to access global state.

```ts
import { useGlobalState } from "@rlean/core";
import * as entities from "lib/entities";

const [{ stateObject, anotherStateObject }] = useGlobalState<typeof entities>();
```

Typing the useGlobalState using the typeof entities, we will be able to autocomplete all state objects. These objects will have the type of `EntityState<EntityType>`.

### useGet

The useGet custom hook is what populates all of your state objects based on whatever properties are set in your entity, and can be called from any component that relies on that state object. A dependency will be created for the param values, so if the params change, the custom hook will fire again. If no params are set, the custom hook will fire only once. useGet also takes an optional callback param that will be provided with the state value set in the custom hook, as well as the response if an API call is made. Note that the component is wrapped in React Memo, as all components using state values should be. This package uses Context API under the hood and this will prevent components from re-rendering unnecessarily.

> Note: this also relies on @rlean/utils to check that ID of someStateValue exists before attempting to use the value. This approach also assumes that demoEntity cannot be null, and that the initial state value is null, but an empty value from the API is a valid value.

```js
import React, { memo } from 'react';
import { useGlobalState, useGet } from '@rlean/core';
import { getValue } from '@rlean/utils';
import { Spinner } from 'some-ui-library';
import { DemoEntity } from 'lib/entities';

export const MyReactComponent = memo(() => {
	const [{ demoEntity, someStateValue, isLoading }] = useGlobalState();

	const id = getValue(someStateValue, 'id', null);
  useGet({ entity: DemoEntity, params: { id } });

	if (!demoEntity || demoEntity.isLoading) {
		return <Spinner />
	}

	return (
		// some component dependent on demoEntity
	)
});
```

An example of useGet using the optional callback:

```js
useGet(
  {
    entity: DemoEntity,
    params: {
      id: id,
    },
  },
  (value, response) => {
    if (response.status !== 200) {
      // handle error
    }
    if (value) {
      // Do something with the value. Note that storage is handled for you and the value should be accessed using the getGlobalState hook if possible.
    }
  }
);
```

It's also possible to use the useGet hook in this way:

```js
import React, { memo } from 'react';
import { useGlobalState, useGet } from '@rlean/core';
import { getValue } from '@rlean/utils';
import { Spinner } from 'some-ui-library';
import { DemoEntity } from 'lib/entities';

export const MyReactComponent = memo(() => {
  const [{ demoEntity, someStateValue }] = useGlobalState();
  const [get] = useGet();

	const id = getValue(someStateValue, 'id', null);

  if (id) {
    get({ entity: DemoEntity, params: { id } });
  }

	if (!demoEntity || demoEntity.isLoading) {
		return <Spinner />
	}

	return (
		// some component dependent on demoEntity
	)
});
```

If the getURL attribute looks like this and the value of id is 1:

```js
const DemoEntity = define("demoEntity", {
  getURL: "/SomeApiPath/:id",
});
```

The call will look like: (uri-from-config)/SomeApiPath/1

If the getPath looks like this and the value of id is 1:

```js
const DemoEntity = define("demoEntity", {
  getURL: "/SomeApiPath",
});
```

The call will look like: (uri-from-config)/SomeApiPath?id=1

### usePost

The usePost hook is used to post against the API and takes an options object and an optional callback function.

```js
import { useGlobalState, usePost } from "@rlean/core";
import { DemoEntity } from "lib/entities";

const [post] = usePost();

const updateDb = async () => {
  await post({ entity: DemoEntity, body: { value: "value" } });
};
```

Or...

```js
import { useGlobalState, usePost } from "@rlean/core";
import { DemoEntity } from "lib/entities";

const [post] = usePost();

const updateDb = async () => {
  await post(
    {
      entity: DemoEntity,
      body: {
        value: "value",
      },
    },
    (response) => {
      if (response) {
        // handle response
      }
    }
  );
};
```

### usePatch, usePut, & useDelete

The usePatch, usePut, and useDelete hooks work similarly to the usePost hook and have the same syntax.

### options

The options that are available for use with useGet are **entity** and **params**. The options that are available for usePost, usePatch, usePut, and useDelete are **entity**, **body**, and **save**. The options available for useSave are **entity** and **value**. The **save** option is false by default. If set to true, the response data will override the state object and store object if persistData is set to true on the entity.

### useSave

The useSave hook is used when saving a state value, and takes an options object that includes the entity being updated and the new value, and an optional type. Saving a value will update state and storage if the persistData attribute is 'true' on the entity (the default setting).

```js
import { useGlobalState, useSave } from "@rlean/core";
import { DemoEntity } from "lib/entities";

const [save] = useSave();

const buttonClicked = async (newValue) => {
  await save({ entity: DemoEntity, value: newValue });
};
```

### useRemove

The useRemove hook is used to remove an object from state and storage if applicable, and takes an options object that includes the entity being updated.

```js
import { useGlobalState, useRemove } from "@rlean/core";
import { DemoEntity } from "lib/entities";

const [remove] = useRemove();

const removeValue = async () => {
  await remove({ entity: DemoEntity });
};
```

### removeAll

The removeAll function is an asynchronous function that is used to clear all storage data.

## Other entity properties

### isLoading

isLoading is a property that is included by default on the entity if the state object is populated by an API call. This can be used to render loading animations.

```js
import { useGlobalState } from "@rlean/core";
import { Spinner } from "some-ui-library";
import { DemoEntity } from "lib/entities";

export const MyReactComponent = () => {
  const [{ demoEntity }] = useGlobalState();

  if (demoEntity.isLoading) {
    return <Spinner />;
  }

  return {
    /* component dependent on demoEntity */
  };
};
```

### init

The init property will be set to true once the entity has been initialized by the framework.

### data

The data property will be set to the value returned from the API if the response is an array.

### lastUpdated

lastUpdated is a property that is included by default on the entity if the state object is populated by an API call. This is useful for debugging.

### refetch

Calling the refetch function on an entity will cause the get function to execute again without setting the isLoading property. This is useful for loading data in the background after the initial call has already been made.

```js
import React from "react";
import { useGlobalState, useGet } from "@rlean/core";
import { Spinner } from "some-ui-library";
import { DemoEntity } from "lib/entities";

export const MyReactComponent = () => {
  const [{ demoEntity }] = useGlobalState();
  const id = 1;

  useGet({ entity: DemoEntity, params: { id } });

  setInterval(function () {
    if (demoEntity.lastUpdated) {
      demoEntity.refetch();
    }
  }, 500000);

  if (demoEntity.isLoading) {
    return <Spinner />;
  }

  return {
    /* component dependent on demoEntity */
  };
};
```

### isRefetching

The isRefetching property works similarly to the isLoading property, but is used when the refetch function is called.

### error

# The error property will display if there is an API error.

LastUpdated is a model that is include by default if there are entities that make calls against the API to populate one or more objects in state. This state object is used by the syncAfterTimeElapsed model attribute, but is also useful for debugging.

## Tips

- Wrap your functional components in [React memo](https://reactjs.org/docs/react-api.html#reactmemo). This package uses Context API for state management. Using [React memo](https://reactjs.org/docs/react-api.html#reactmemo) will prevent your components from re-rendering unnecessarily when there are state changes that your components don't care about.

- Make sure entities are included in the export files in the lib/entities folder. If they are not all exported from the index.js file, those objects will not work.
- Make sure entities and utilities are included in the export files in the lib/entities and lib/utilities folder. If they are not all exported from the index.js files in each of those folders, those objects will not work.

## Coming soon

- Webhook integration.
- Better logging and error handling support.
- CLI tool to generate entities for you, possibly one that can read a swagger.json file.
