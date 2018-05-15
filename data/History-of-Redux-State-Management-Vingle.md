---
path: "/blog/history-of-redux-state-management-vingle"
title: "Part 1: History of Redux State Management at Vingle"
createdAt: "2018-05-08"
tags: ["react", "redux", "typescript"]
---

_[Part 2: Typescript+Redux Best Practice at Vingle](/blog/typescript-redux-best-practice)_

_This post is a repost of [my post at Vingle Tech Blog](https://medium.com/vingle-tech-blog/part-1-history-of-redux-state-management-at-vingle-565cdcf13df1)._

In this two-part post, I am going to go over the different flavors of Redux state management at [Vingle](https://www.vingle.net) and our thought process behind each iterations we went through over the last year and half. I hope this post guide how you structure your Redux states.

### Genesis: Redux + Immutable.Map

My team chose React to create a small-scale mobile marketing website as a learning experiment. Our main project, at the time, was based on Rails, and Angular 1, and we were separating web applications from Rails to simplify, and speed up our deployment process. That meant we had to create everything from scratch: a new build pipeline, a new webpack configuration, while learning about the vast React ecosystem.

We heard that Redux simplifies debugging application states greatly, and, with the nightmarish memories of debugging Angular 1's watchers, chose to adopt Redux. We also learned a bit about `shouldComponentUpdate` and React's component lifecycle, and wanted to have an immutable state. I was already familiar with high-order immutable objects from my previous work ([this](https://github.com/implydata/immutable-class)), so Immutable.js was an obvious choice.

In the end, we have Redux setup looking like this:

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
function fetchedPost(post) {
  return {
    type: "FETCHED",
    payload: {
      post,
    },
  };
}
```

### 1st Iteration: Typescript + Redux + Immutable.Map

Once we have gotten more used to React, and Redux, and proven that we could develop new features much faster on the mobile page, we started migrating our main web application to React. But unlike the proof-of-concept mobile page, this app would have dozens of routes and reducers, and much more complex components, so we chose to use Typescript for this app.

Unfortunately, Immutable.Map with different types of values (number, boolean, other Maps, or Lists, for example) does not play well with Typescript. The following is a Typescript definition of Immutable.Map:

```typescript
interface Keyed<K, V> extends Collection<K, V>, Iterable.Keyed<K, V> { ... }
interface Map<K, V> extends Keyed<K, V> {
  set(key: K, value: V): Map<K, V>;
  setIn(keyPath: Array<any>, value: any): Map<K, V>;
  ...
}
```

As you can see, there isn't a good way to specify different types of a Immutable.Map's values. So we ended up doing this hacky workaround.

```typescript
// scaffolding
interface IPostStateImmutable {
  get(key: "post"): IPostImmutable | null; // IPostImmutable is also another hacky interface like IPostStateImmutable.
  get(key: "isLoading"): boolean;

  set(key: "post", value: IPostImmutable | null): IPostStateImmutable;
  set(key: "isLoading", value: boolean): IPostStateImmutable;
  withMutations(
    mutator: (mutable: IPostStateImmutable) => IPostStateImmutable,
  ): IPostStateImmutable;
}

// reducers
const INITIAL_STATE: IPostStateImmutable = Map({
  post: null,
  isLoading: false,
});

function postReducer(
  state: IPostStateImmutable = INITIAL_STATE,
  action,
): IPostStateImmutable {
  switch (action.type) {
    case "FETCHED": {
      return state.withMutations(currentState =>
        currentState.set("post", action.payload.post).set("isLoading", false),
      );
    }
    case "UPDATED_TITLE": {
      return state.setIn(["post", "title"], action.payload.title);
    }
    default: {
      return state;
    }
  }
}

// actions stay the same
```

Needless to say, this pattern is painful to maintain, and hard to guarantee correctness. Typescript got in the way rather than helping us.

### 2nd Iteration: Typescript + Redux + Immutable.Record

So we looked for a better way to tie Typescript and Immutable.js together. Then we found that there was another Immutable class called `Immutable.Record` and a library called `typed-immutable-record`. With the library, we created a type-safe Immutable Record:

```typescript
import { TypedRecord, recordify } from "typed-immutable-record";

// scaffolding
interface IPostState {
  post: IPost | null;
  isLoading: boolean;
}

interface IPostStateRecordPart {
  post: IPostRecord; // this interface is created in a similar fashion.
  isLoading: boolean;
}

interface IPostStateRecord
  extends TypedRecord<IPostStateRecord>,
    IPostStateRecordPart {}

function recordifyPostState(plainState: IPostState): IPostStateRecord {
  return recordify<IPostStateRecordPart, IPostStateRecord>({
    post: plainState.post
      ? recordify<IPostRecordPart, IPostRecord>(plainState.post)
      : null,
    isLoading: plainState.isLoading,
  });
}

// reducers
const INITIAL_STATE: IPostStateRecord = recordifyPostState({
  post: null,
  isLoading: false,
});

function postReducer(
  state: IPostStateRecord = INITIAL_STATE,
  action,
): IPostStateRecord {
  switch (action.type) {
    case "FETCHED": {
      return state.withMutations(currentState =>
        currentState.set("post", action.payload.post).set("isLoading", false),
      );
    }
    case "UPDATED_TITLE": {
      return state.setIn(["post", "title"], action.payload.title);
    }
    default: {
      return state;
    }
  }
}
```

It took some time for us to understand how to scaffold Record interfaces correctly but we managed to create type-safe redux states with both dot notations, and helper methods like `setIn` or `withMuations`. _However_, as you can see from the code above, we had to create a large number of interfaces, especially when our states were deeply nested. Once we got the pattern down, it wasn't difficult to follow the pattern but it was a lot of work which disincentivized our team to create smaller, and isolated reducers. But we didn't know any better, so we carried on.

### 3rd Iteration: Typescript + Redux + Typescript Readonly Interfaces

During a random conversation with an engineer at another startup, I learned about readonly properties in Typescript, and realized those properties could replace Immutable.js completely.

```typescript
// scaffolding
interface IPostState
  extends Readonly<{
      post: IPost | null;
      isLoading: boolean;
    }> {} // this has to be a Readonly interface as well.

// reducers
const INITIAL_STATE: IPostState = {
  post: null,
  isLoading: false,
};

function postReducer(state: IPostState = INITIAL_STATE, action): IPostState {
  switch (action.type) {
    case "FETCHED": {
      return {
        post: action.payload.post,
        isLoading: false,
      };
    }
    case "UPDATED_TITLE": {
      return {
        ...state,
        post: {
          ...state.post,
          title: action.payload.title,
        },
      };
    }
    default: {
      return state;
    }
  }
}
```

By using Readonly interfaces, the scaffolding is reduced to a quarter by removing `RecordPart`, `Record`, and `recordify`. However, there is a problem with this approach when you need to update deeply; the case above `UPDATED_TITLE` is such an example. During the conversion, we had some codes go out of hand like this:

```typescript
return {
  ...state,
  post: {
    ...state.post,
    author: {
      ...state.post.author,
      relation: {
        ...state.post.author.relation,
        following: true,
      },
    },
  },
};
```

### 4th Iteration: Typescript + Redux + Typescript Readonly Interfaces + Normalizr

We could solve this problem by adopting a deep merge library, but we feared that those libraries may not be type-safe. After giving some thoughts, we determined that the real problem was with the deeply nested structures of our states and planned to flatten the states by normalizing. Of the two popular normalizing libraries, `redux-orm`, and `normalizr`, we chose the latter for its simplicity.

Our final, and current version of redux looks like the following:

```typescript
// post reducer
interface IPostState
  extends Readonly<{
      postId: number | null;
      isLoading: boolean;
    }> {}

const INITIAL_STATE: IPostState = {
  postId: null,
  isLoading: false,
};

function postReducer(state: IPostState = INITIAL_STATE, action): IPostState {
  switch (action.type) {
    case "FETCHED": {
      return {
        postId: action.payload.postId,
        isLoading: false,
      };
    }
    default: {
      return state;
    }
  }
}

// normalized entity reducer
interface IEntityState
  extends Readonly<{
      posts: {
        [postId: number]: INormalizedPost;
      };
    }> {}

function entityReducer(
  state: IEntityState = { posts: {} },
  action,
): IPostState {
  switch (action.type) {
    case "ADD_ENTITIES": {
      return {
        ...state,
        posts: {
          ...state.posts,
          ...entities.posts,
        },
      };
    }
    case "UPDATED_TITLE": {
      const postToUpdate = state.posts[action.payload.postId];
      if (!postToUpdate) {
        return state;
      }
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.payload.postId]: {
            ...postToUpdate,
            title: action.payload.title,
          },
        },
      };
    }
    default: {
      return state;
    }
  }
}

// action creators
function fetchedPost(postId: number) {
  return {
    type: "FETCHED",
    payload: {
      postId,
    },
  };
}

function addEntities(entities: Partial<IEntityState>) {
  return {
    type: "ADD_ENTITIES",
    payload: {
      entities,
    },
  };
}

// container component
function mapStateToProps(state: IAppState, _routeProps: any) {
  return {
    post: denormalize(state.postState.post, postEntity, state.entities),
  };
}
```

### Afterword

When I look back, part of me regret that we didn't do more research which could have saved a lot of time; [this collection of redux-related libraries](https://github.com/markerikson/redux-ecosystem-links) would have been helpful, and normalizing is already in [official Redux documention](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape). However, part of me also feel like we would have never appreciated the utility of these libraries and techniques because we didn't know the downsides of not using those libraries and techniques. And _that_ is why I wrote this post; I hope you understand what problems lie ahead and save yourself some time.
