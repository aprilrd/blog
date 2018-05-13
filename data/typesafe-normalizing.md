---
path: "/blog/type-safe-normalizing"
title: "Typesafe normalizing"
---

## Typing for safe normalization

[normalizr](https://github.com/paularmstrong/normalizr) is a simple utility to normalize your data structure. However, normalizr's type definition is seriously lacking. So you need to create a number of interfaces to use normalization safely. The code below is a typical normalization scenario:

```typescript
import { schema, normalize, denormalize } from "normalizr";
export const userEntity = new schema.Entity("user");
export const cardEntity = new schema.Entity("cards", {
  data: { author: userEntity },
});
export const cardListEntity = new schema.Array(cardEntity);

/// action creators
export const ActionCreators = {
  fetchCards(payload: {cards: any}) => // what's the type of cards?
    createAction({type: ActionTypes.FETCH_CARDS, payload}),
  addEntities(payload: {entities: any}) => // what's the type of entities?
    createAction({type: ActionTypes.ADD_ENTITIES, payload}),
}

export const fetchCards = async () => {
  const cards = await API.fetchCards();
  const { result, entities } = normalize(cards, cardListEntity);
  ActionCreators.fetchCards({cards: result});
  ActionCreators.addEntities({entities});
};
```

### Normalized data interfaces

### Typed normalize and denormalize

```typescript
```
