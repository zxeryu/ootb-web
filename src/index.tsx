import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { StoreProvider, Store } from "./core/store";

const store$ = Store.create({ name: "zx", age: 18 });

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider value={store$}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
