import React from "react";
import { Actor, useStore, useStoreSelector } from "../../core/store";
import { get } from "lodash";

const tempActor = Actor.of("age");

const increment = tempActor.named("age").effectOn("age", (state = 0) => {
  return state + 1;
});

export const Age = () => {
  console.log("-------Age------");
  const store$ = useStore();
  const age = useStoreSelector((state) => get(state, ["age"], 0));
  return (
    <div>
      <p>{age}</p>
      <button
        onClick={() => {
          increment.invoke(store$);
        }}>
        add
      </button>
    </div>
  );
};
