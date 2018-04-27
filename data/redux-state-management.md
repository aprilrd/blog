---
path: "/blog/History-of-Redux-State-Management-Vingle"
title: "Part 1: History of Redux State Management at Vingle"
tags: ["react", "redux", "typescript"]
---

In this two-part post, I am going to go over the different flavors of Redux state management at [Vingle](www.vingle.net) and our thought process behind it over the last year and half. I hope this post guide other small-to-medium sized Redux-based applications.

### Genesis: Redux + Immutable.Map

My team chose React to create a small-scale mobile marketing website as a learning experiment. Our main project, at the time, was based on Rails, and Angular 1, and we were trying to separate web applications from Rails to simplify and speed up our deployment process. That meant that we had to create everything from scratch: a new Jenkins build pipeline, a new webpack configuration, while learning about the vast React ecosystem.

We heard that Redux can simplify debugging application states greatly, and, with the fresh, nightmarish memories of debugging Angular 1's watchers, decided to adopt Redux. We also learned a bit about `shouldComponentUpdate` and React's update logic, and wanted to have an immutable state. I was already familiar with high-order immutable objects from my previous work ([this](https://github.com/implydata/immutable-class)), so immutable.js was a natural choice.

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

The supposedly small-scale react app worked fine at the time. Now we wanted to rebuild our web app

### 2nd Iteration: Typescript + Redux + Immutable.Record

### 3rd Iteration: Typescript + Redux + Typescript Readonly Interfaces

### 4th, and the current Iteration: Typescript + Redux + Typescript Readonly Interfaces + Normalizr
