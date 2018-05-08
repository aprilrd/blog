---
path: "/blog/typescript-redux-best-practice"
title: "Part 2: Typescript+Redux Best Practice at Vingle"
tags: ["react", "redux", "typescript"]
---

In this part two, I am going to describe our team's current best practices to make Typescript work for you when working with Redux.

* Creating Type-safe Actions and Reducers
* Typing Redux Container
* Typing normalizr and denormalizr

### Creating Type-safe Actions and Reducers

Considering how reducers are just simple functions that accept two arguments, you would expect Typescript to work well with those two. States do. But actions, because `dispatch` accepts any types of arguments, cannot be typed safely without developers' involvement. Before Typescript 2.8, you could achieve type-safety using string enum:

```typescript
enum ActionTypes {
  FETCH_USER = "FETCH_USER",
}

interface IFetchUserAction {
  type: ActionTypes.FETCH_USER;
  payload: { userId: string }
}

interface IOtherAction {
  type: "____________________";
}

type Actions = IFetchUserAction | IOtherAction;

function fetchUser(userId: string): IFetchUserAction {
  return {
    type: ActionTypes.FETCH_USER,
    payload: {
      userId,
    }
  };
}

function reducer(
  state = INITIAL_STATE,
  action: Actions,
): IState {
  switch (action.type) {
    case ActionTypes.FETCH_USER: {
      // in this closure, Typescript knows that action is of interface IFetchUserAction, thanks to enum ActionTypes.
      return {
        ...state,
        userId: action.payload.userId,
      };
    }
    default: {
      return state
    }
  }
```

`IOtherAction` is needed so that Typescript won't complain about default case in switch statement. This works OK if you ignore the fact that there are essentially two duplicate type definitions in your action interfaces, and action creators. Starting with [Typescript 2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html), you can use `ReturnType` to remove action interfaces.

```typescript
import { ActionCreatorsMapObject } from "redux";
// interface ActionCreatorsMapObject {
//   [key: string]: ActionCreator<any>;
// }

type ActionUnion<T extends ActionCreatorsMapObject> = ReturnType<
  T[keyof T]
>;

enum ActionTypes {
  FETCH_USER = "FETCH_USER",
}

function createAction<T extends { type: ActionTypes }>(d: T): T {
  return d;
}

export const ActionCreators = {
  fetchUser(payload: {userId: string}) =>
    createAction({type: ActionTypes.FETCH_USER, payload}),
}

type Actions = ActionUnion<typeof ActionCreators>;

function reducer(
  state = INITIAL_STATE,
  action: Actions,
): IState {
  switch (action.type) {
    case ActionTypes.FETCH_USER: {
      // in this closure, Typescript knows that action is of ActionCreators.fetchUser's ReturnType.
      return {
        ...state,
        userId: action.payload.userId,
      };
    }
    default: {
      return state
    }
  }
```

### Extracredit (Typescript tips not related to Redux)

#### Use Ambient Types to simplify your dependencies with `typeRoots` option.

#### Know your React types
