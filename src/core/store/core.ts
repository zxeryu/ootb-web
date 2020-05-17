import { Actor, TKeyCreator } from "./actor";
import { Subject, BehaviorSubject } from "rxjs";
import { shallowEqual } from "./utils";

export class Store<TRoot extends { [key: string]: any } = {}> extends BehaviorSubject<TRoot> {
  static create<TState>(initialState: TState = {} as TState) {
    return new Store<TState>(initialState);
  }

  actor$ = new Subject<Actor>();

  // applyMiddleware(...middlewares: IMiddleware<TRoot>[]) {
  //   if (middlewares.length === 0) {
  //     return;
  //   }
  //   const chain = middlewares.map((middleware) => middleware(this));
  //   this.dispatch = compose(...chain)(this._dispatch);
  // }
  //
  // epicOn(epic: IEpic<TRoot>) {
  //   return epic(this.actor$, this).subscribe((actor) => {
  //     if (actor) {
  //       this.dispatch(actor);
  //     }
  //   });
  // }

  dispatch = (actor: Actor) => {
    return this._dispatch(actor);
  };

  getState = (): TRoot => {
    return this.value;
  };

  private _dispatch = (actor: Actor): Actor => {
    if (actor.effect) {
      const nextValue = actor.effect(this.value, actor);
      if (!shallowEqual(nextValue, this.value)) {
        this.next(nextValue);
      }
    }
    this.actor$.next(actor);
    return actor;
  };
}

export function effectOn<TRoot, TActor extends Actor>(
  keyOrKeyCreator: string | TKeyCreator<TActor>,
  effect: (root: TRoot, actor: TActor) => TRoot | undefined,
) {
  return function (root: any = {}, actor: TActor) {
    const k = typeof keyOrKeyCreator === "function" ? keyOrKeyCreator(actor) : keyOrKeyCreator;
    if (k === "") {
      return root;
    }
    const nextState = effect(root[k], actor);
    const nextRoot: typeof root = {};
    for (const key in root) {
      if (key === k) {
        continue;
      }
      nextRoot[key] = root[key];
    }
    if (typeof nextState !== "undefined") {
      nextRoot[k] = nextState;
    }
    return nextRoot;
  };
}
