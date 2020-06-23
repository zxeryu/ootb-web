import React from "react";
import { Counter } from "./Counter";
import { Age } from "./Age";

export const Home = () => {
  return (
    <div>
      home
      <Counter />
      <Age />
    </div>
  );
};

export const Some = () => {
  return <div>some</div>;
};
