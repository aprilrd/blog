---
path: "/blog/History-of-Redux-State-Management-Vingle"
title: "Part 1: History of Redux State Management at Vingle"
tags: ["react", "redux", "typescript"]
---

In this two-part post, I am going to go over the different flavors of Redux state management at [Vingle](www.vingle.net) and our thought process behind it over the last year and half. I hope this post guide other small-to-medium sized Redux-based applications.

### Genesis: Redux + Immutable.Map

My team chose React to create a small-scale mobile marketing website as a learning experiment. Our main project, at the time, was based on Rails, and Angular 1, and we were trying to separate web applications from Rails to simplify and speed up our deployment process. That meant that we had to create everything from scratch: a new Jenkins build pipeline, a new webpack configuration, while learning about the vast React ecosystem.

We heard that Redux can simplify debugging application states greatly, and, with the fresh, nightmarish memories of debugging Angular 1's watchers, decided to adopt Redux. We also learned a bit about `shouldComponentUpdate` and React's update logic, and wanted to have an immutable state. I was already familiar with high-order immutable objects from my previous work ([this](https://github.com/implydata/immutable-class)), so immutable.js was a natural choice.

At the end we have Redux setup looking like this:

```javascript
import { Map } from "immutable";

// reducers
const INITIAL_STATE = Map({ post: null, isLoading: false });

function postReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "FETCHED": {
      return state.withMutations(currentState =>
        currentState.set("post", action.payload.post).set("isLoading", false),
      );
    }
    default: {
      return state;
    }
  }
}

// action creators
export function fetchedPost(post) {
  return {
    type: "FETCHED",
    payload: {
      post,
    },
  };
}
```

#### What would I have done differently?

* Should not have adopted Redux at the very beginning to ease the learning curve. We ended up with some bad reducer pollutions.
* We didn't have `create-react-app` at the time, but we could have referenced other webpack configs to minimize the set up time.

### 1st Iteration: Typescript + Redux + Immutable.Map

Once we have gotten more used to React, and Redux and proven that we could develop new features faster on the mobile page, we started to migrate our desktop web application to React as well. But unlike the proof-of-concept mobile page, this app will have dozens of routes and reducers, and much more complex components, so we chose to use Typescript for the desktop app.

Unfortunately, Immutable.Map with different types of values (number, boolean, other Maps, or Lists, for example) did not play well with Typescript. The following is a Typescript definition of Immutable.Map:

```typescript
interface Keyed<K, V> extends Collection<K, V>, Iterable.Keyed<K, V> { ... }
interface Map<K, V> extends Keyed<K, V> { ... }
```

As you can see, there isn't a good way to specify different types of a Immutable.Map's values. So we ended up doing this hacky workaround.

```typescript
interface IToastImmutable {
  get(key: "type"): ToastTypes;
  get(key: "message"): string;

  set(key: "type", value: ToastTypes): IToastImmutable;
  set(key: "message", value: string): IToastImmutable;
  withMutations(
    mutator: (mutable: IToastImmutable) => IToastImmutable,
  ): IToastImmutable;
}

// actual usage
const toast: IToastImmutable = Immutable.Map({
  type: "warning",
  message: "Warning!",
});
```

Needless to say, this style was painful to maintain, and hard to guarantee correctness. Typescript got in the way rather than helping us.

### 2nd Iteration: Typescript + Redux + Immutable.Record

So we looked for different

### 3rd Iteration: Typescript + Redux + Typescript Readonly Interfaces

### 4th, and the current Iteration: Typescript + Redux + Typescript Readonly Interfaces + Normalizr
