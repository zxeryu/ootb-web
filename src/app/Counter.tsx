import React from "react";
import { Actor, useStore, useStoreSelector } from "../core/store";
import { get } from "lodash";

const countActor = Actor.of("count");

const increment = countActor.named("increment").effectOn("count", (state = 0) => {
  return state + 1;
});

const decrement = countActor.named("decrement").effectOn("count", (state = 0) => {
  return state - 1;
});

export const Counter = () => {
  console.log("-------counter------");
  const store$ = useStore();
  const count = useStoreSelector((state) => get(state, ["count"], 0));
  return (
    <div>
      <p>{count}</p>
      <button
        onClick={() => {
          increment.with({}).invoke(store$);
        }}>
        increment
      </button>
      <button
        onClick={() => {
          decrement.with({}).invoke(store$);
        }}>
        decrement
      </button>
    </div>
  );
};
