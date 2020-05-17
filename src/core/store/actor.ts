import { effectOn } from "./core";

export enum AsyncStage {
  STARTED = "STARTED",
  DONE = "DONE",
  FAILED = "FAILED",
  CANCEL = "CANCEL",
}
export interface IActorOpt<TArg = any, TOpts = any> {
  group?: string;
  name?: string;
  stage?: AsyncStage;
  effect?: (state: any, actor: Actor<TArg, TOpts>) => any;
  arg?: TArg;
  opts?: TOpts;
}
export type TKeyCreator<TActor extends Actor> = (actor: TActor) => string;

export class Actor<TArg = any, TOpts = any> {
  static of<TArg = any, TOpts = any>(group: string) {
    return new Actor<TArg, TOpts>({ group });
  }

  group = "UN_GROUPED";
  name = "UN_NAMED";
  stage?: AsyncStage;

  effect?: (state: any, actor: Actor<TArg, TOpts>) => any;

  arg: TArg = {} as TArg;
  opts: TOpts = {} as TOpts;

  get type(): string {
    const opts = {} as any;
    let hasOpts = false;
    for (const k in this.opts) {
      if (k !== "parentActor") {
        opts[k] = this.opts[k];
        hasOpts = true;
      }
    }
    return `@@${this.group}/${this.name}${this.stage ? `::${this.stage}` : ""}${
      hasOpts ? `${JSON.stringify(this.opts)}` : ""
    }`;
  }

  constructor(opt: IActorOpt) {
    this.group = opt.group || this.group;
    this.name = opt.name!;
    this.stage = opt.stage;
    this.effect = opt.effect;
    this.arg = opt.arg!;
    this.opts = opt.opts || ({} as TOpts);
  }

  named<TNamedArg = TArg, TNameOpts = TOpts>(name: string, opts?: TNameOpts): Actor<TNamedArg, TNameOpts & TOpts> {
    return new (this.constructor as any)({
      ...(this as any),
      name,
      opts: {
        ...(this.opts as any),
        ...(opts as any),
      },
    });
  }

  effectWith(effect: (state: any, actor: Actor<TArg, TOpts>) => any): this {
    return new (this.constructor as any)({
      ...(this as any),
      effect,
    });
  }

  effectOn<TState = any>(
    keyOrKeyCreator: string | TKeyCreator<Actor<TArg, TOpts>>,
    effect: (state: any, actor: Actor<TArg, TOpts>) => TState | undefined,
  ) {
    return this.effectWith(effectOn(keyOrKeyCreator, effect));
  }

  with(arg: TArg, opts?: TOpts): this {
    return new (this.constructor as any)({
      ...(this as any),
      arg,
      opts: {
        ...(this.opts as any),
        ...(opts as any),
      },
    });
  }

  invoke(dispatcher: { dispatch: (actor: Actor) => void }) {
    dispatcher.dispatch(this);
  }

  isSameGroup = (actor: Actor<TArg, TOpts>) => actor.group === this.group;

  is = (actor: Actor): actor is Actor<TArg, TOpts> => {
    const isSame = this.isSameGroup(actor) && actor.name === this.name;
    if (this.stage) {
      return isSame && actor.stage === this.stage;
    }
    return isSame;
  };
}
