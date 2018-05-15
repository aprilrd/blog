---
path: "/blog/typescript-redux-best-practice"
title: "Part 2: Typescript+Redux Best Practice at Vingle"
createdAt: "2018-05-15"
tags: ["react", "redux", "typescript"]
---

_[Part 1: History of Redux State Management at Vingle](/blog/history-of-redux-state-management-vingle)_

In this part two, I am going to describe our team's current best practices to make Typescript work for you when working with Redux.

* Creating Type-safe Actions and Reducers
* Properly typing Redux Container

## Creating Type-safe Actions and Reducers

Considering how reducers are just simple functions that accept two arguments, you would expect Typescript to work well with those two. States do. But actions, because `dispatch` accepts any types of arguments, cannot be typed safely without developers' involvement. If you don't type your actions, your reducer will end up in the not-so-ideal state:

```typescript
function reducer(state = INITIAL_STATE, action: Redux.Action) {
  switch (action.type) {
    case ActionTypes.FETCH_USER: {
      // simple case
      return {
        ...state,
        userId: (action.payload as any).userId,
      };
    }
    default: {
      return state;
    }
  }
}
```

You can catch some of type errors with unit tests, but you will miss some properties and lose easy refactoring provided by Typescript. To acheive type-safety before Typescript 2.8, you could use string enum:

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

`IOtherAction` is needed so that Typescript won't complain about default case in switch statement (that is, exhaustiveness checking). This works OK if you ignore the fact that there are essentially two duplicate type definitions in your action interfaces, and action creators. Starting with [Typescript 2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html), you can use `ReturnType` to remove action interfaces. The code below is our way to type actions and reducers.

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

## Typing Redux Container components

Typing Redux container components correctly is important to use, and test the components correctly. Before our team learned how to type components, we ended up with tests like this:

```typescript
const Container = (props: { data: any; dispatch: Dispatch<any> }) => {
  // render something and do something useful
  return <div />;
};

const ConnectedContainer = connect()(Container);

describe("", () => {
  let wrapper: ReactWrapper;
  beforeEach(() => {
    const store = mockStore(state);
    wrapper = mount(<ConnectedContainer data dispatch={store.dispatch} />, { store });
  });

  ...
});
```

So let's dive in.

Before you try to type Redux container components properly, you need to understand the type definition of `connect`. Carefully read the code below I quoted from Redux type definition (comments are mine). The definition uses a lot of type overloading but I will go through some cases to help you understand what exactly goes on.

_Please note that the definitions below are from `@types/react-redux@5.0.19`._

```typescript
export interface DispatchProp<S> {
  dispatch?: Dispatch<S>;
}

export interface InferableComponentEnhancerWithProps<
  TInjectedProps,
  TNeedsProps
> {
  <P extends TInjectedProps>(component: Component<P>): ComponentClass<
    Omit<P, keyof TInjectedProps> & TNeedsProps
  > & { WrappedComponent: Component<P> };
}

export type InferableComponentEnhancer<
  TInjectedProps
> = InferableComponentEnhancerWithProps<TInjectedProps, {}>;

export interface Connect {
  (): InferableComponentEnhancer<DispatchProp<any>>;

  ...

  // this is an all-encompassing definition
  // TStateProps is a type for props generated by mapStateToProps
  // TDispatchProps is a type for props generated by mapDispatchToProps
  // TOwnProps is a type for props from the container component's parent.
  // TMergedProps is a type for props generated by merge.
  // State is a type for Redux store.
  <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}, State = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
        mergeProps: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
        options: Options<State, TStateProps, TOwnProps, TMergedProps>
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;
}
```

### When you don't pass in any argument to connect

This is when you only need `dispatch` inside your container.

```typescript
const Container = (props: { data: any; dispatch: Dispatch<any> }) => {
  // render something and do something useful
  return <div />;
};

export default connect()(Container);
```

As there are no arguments to `connect`, all connect will do is to inject `dispatch<any>` into props.

### When you pass in mapStateToProps to connect

If you want to map only state to props, say for render only components, you

```typescript
type SearchData = { query: string };

type AppState = {
  searchData: SearchData;
};

type Props = { query: string; data: any; dispatch: Dispatch<any> };

function mapStateToProps(state: AppState) {
  return {
    query: state.searchData.query,
  };
}

const Container = (_props: Props) => {
  // render something and do something useful
  return <div />;
};

const A = connect(mapStateToProps)(Container);

<A data />; // this is valid
<A data dispatch={store.dispatch} />; // this isn't valid
```

It almost looks like a magic as Redux type definition does a lot of heavy lifting for us. Let's examine what actually happens inside the code above.

```typescript
interface Connect {
  <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, State = {}>(
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
  ): InferableComponentEnhancerWithProps<
    TStateProps & DispatchProp<any> & TOwnProps,
    TOwnProps
  >;
}
```

This^ `connect` definition is the overloaded type definition used. In the definition, `mapStateToProps` is expanded to

```typescript
(initialState: State, ownProps: TOwnProps) => (
  state: State,
  ownProps: TOwnProps,
) => TStateProps;
```

So Typescript will infer `TStateProps`, and `State` to be `{query: string}`, and `AppState` from the argument `mapStateToProps`. `InferableComponentEnhancerWithProps` is expanded to

```typescript
<P extends (TStateProps & DispatchProp<any> & TOwnProps)>(component: Component<P>): ComponentClass<Omit<P, keyof (TStateProps & DispatchProp<any> & TOwnProps)> & TOwnProps> & {WrappedComponent: Component<P>}
```

And Typescript will infer `P` to be `Props`, and check whether the container component's `props` is larger than the union of `TStateProps`, `DispatchProp<any>`, and `TOwnProps`.

If I put the logic above into code, it looks like the following:

```typescript
type TStateProps = ReturnType<typeof mapStateToProps>;
type TOwnProps = Omit<Props, keyof TStateProps | keyof DispatchProp<any>>; // this results in { data: any }. But this isn't necessary and you can use {} without a problem.

const B = connect<TStateProps, {}, TOwnProps, AppState>(mapStateToProps)(
  Container,
);

<B data />; // this is valid
<B data dispatch={store.dispatch} />; // this isn't valid
```

### When you pass in both mapStateToProps and mapDispatchToProps to connect

This isn't hard to understand once you understood how Redux type definition handles `mapStateToProps`. `mapDispatchToProps` is treated like `mapStateToProps`. For your reference, I included the overloaded type below.

```typescript
interface Connect {
  <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = {}>(
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
    mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
  ): InferableComponentEnhancerWithProps<
    TStateProps & TDispatchProps & TOwnProps,
    TOwnProps
  >;
}
```

### When you also pass in mergeProps

This is also rather straightforward. Instead of merging `TStateProps`, `TDispatchProps`, and `TOwnProps` naively for the component definition, `Connect` will now depend on `mergeProps` to merge these props. The only additional check, (or inference) is whether `mergeProps` is of type `(stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: TOwnProps): TMergedProps;`.

### What this means

First of all, congratulations on getting through all these different types! Now you get how `Connect` works. But, it turns out you don't need to type things directly when you use Redux's `Connect`. However, other HOC's definitions will vary, and you will need to learn how their type systems work.

## Extracredit (Typescript tips not related to Redux)

### Know your types in React

Knowing React types helps your code to work with React seamlessly. Here is the usual go-to list for us.

```
React.Component<P, S>
React.StatelessComponent<P>
React.ReactElement = instantiated React Component
React.ReactNode = React.ReactElement + Renderable primitive types (object is not valid). `children` has this type
React.CSSProperties
React.ReactEventHandler
React.<Input>Event
React.HTMLProps<ElementType> = Used to extend your component props. Ex) TOwnProps & React.HTMLProps<HTMLDivElment>
```

### How to type HOCs that inject props

The following code is an excerpt from `react-intl`. This type definition is straight-forward to set up, but expects the users of the library to know which props are injected into.

```typescript
interface InjectedIntlProps {
  intl: InjectedIntl;
}

function injectIntl<P>(
  component: ComponentConstructor<P & InjectedIntlProps>,
  options?: InjectIntlConfig,
): React.ComponentClass<P> & {
  WrappedComponent: ComponentConstructor<P & InjectedIntlProps>;
};

// actual usage
interface IProps {
  flag: boolean;  
}

class Toast extends React.PureComponent<IProps & InjectedIntlProps> {
  ...
}

export default injectIntl<IProps>(Toast);
```

### Use Ambient Types to simplify your dependencies

This is an easy-to-miss option when you first start using Typescript. You should use `typeRoots` option to avoid adding unnecessary dependencies.

## Afterword

As we develop, and maintain our React apps, we have encountered many bugs. Based on our experience, the harder-to-track, and more critical bugs often stemmed from typeless part of the code. That is why we are determined to type things both comprehensively, and correctly. This isn't the farthest we can go with Typescript, but this is where we are at, and I hope this article has helped you understand Typescript and Redux more deeply.
