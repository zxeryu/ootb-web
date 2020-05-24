import { Actor, TKeyCreator } from "./actor";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { compose, shallowEqual } from "./utils";

export interface IDispatch {
  (actor: Actor): Actor;
}

export interface IMiddlewareAPI<TState = any> {
  dispatch(actor: Actor<TState>): Actor<TState>;

  getState(): TState;
}

export interface IMiddleware<TState = any> {
  (api: IMiddlewareAPI<TState>): (next: IDispatch) => IDispatch;
}

export interface IEpic<TState = any> {
  (actor$: Observable<Actor>, so$: Store<TState>): Observable<Actor>;
}

export function composeEpics(...epics: Array<IEpic<any>>): IEpic<any> {
  return (actor$: Observable<Actor>, so$: Store): Observable<Actor> => {
    return epics.reduce((preActor$, epic) => {
      return epic(preActor$, so$) as any;
    }, actor$);
  };
}

export class Store<TRoot extends { [key: string]: any } = {}> extends BehaviorSubject<TRoot> {
  static create<TState>(initialState: TState = {} as TState) {
    return new Store<TState>(initialState);
  }

  actor$ = new Subject<Actor>();

  applyMiddleware(...middlewares: IMiddleware<TRoot>[]) {
    if (middlewares.length === 0) {
      return;
    }
    const chain = middlewares.map((middleware) => middleware(this));
    this.dispatch = compose(...chain)(this._dispatch);
  }

  epicOn(epic: IEpic<TRoot>) {
    return epic(this.actor$, this).subscribe((actor) => {
      if (actor) {
        this.dispatch(actor);
      }
    });
  }

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
