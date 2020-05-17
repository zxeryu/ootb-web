import React from "react";

const EMPTY: unique symbol = Symbol();

export interface IContainerProviderProps<State = void> {
  initialState?: State;
  children: React.ReactNode;
}

export interface IContainer<Value, State = void> {
  Provider: React.ComponentType<IContainerProviderProps<State>>;
  useContainer: () => Value;
}

export function createContainer<Value, State = void>(
  useHook: (initialState?: State) => Value,
): IContainer<Value, State> {
  let Context = React.createContext<Value | typeof EMPTY>(EMPTY);

  function Provider(props: IContainerProviderProps<State>) {
    let value = useHook(props.initialState);
    return <Context.Provider value={value}>{props.children}</Context.Provider>;
  }

  function useContainer(): Value {
    let value = React.useContext(Context);
    if (value === EMPTY) {
      throw new Error(`Component must be wrapped with <Container.Provider>`);
    }
    return value;
  }

  return { Provider, useContainer };
}
