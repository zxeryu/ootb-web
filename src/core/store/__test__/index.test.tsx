import { Actor, AsyncActor } from "../actor";
import { Store } from "../core";
import { Volume } from "../observable";
import { filter, map } from "rxjs/operators";

describe("store", () => {
  test("AsyncActor", () => {
    const requestActor = AsyncActor.of<any, any>("request");
    const ping = requestActor.named("ping");

    expect(ping.type).toBe("@@request/ping");
    expect(ping.done.type).toBe("@@request/ping::DONE");
    expect(ping.failed.type).toBe("@@request/ping::FAILED");
    expect(ping.started.type).toBe("@@request/ping::STARTED");
  });

  test("state", () => {
    const countActor = Actor.of("counter");
    const increment = countActor.named("increment").effectOn("count", (state: any = 0) => {
      return state + 1;
    });
    const decrement = countActor.named("decrement").effectOn("count", (state: any = 0) => {
      return state - 1;
    });
    const asyncIncrement = countActor.named("async_increment");

    const store$ = Store.create({ count: 0 });

    const countStates: number[] = [];

    Volume.from(store$, (state) => state["count"]).subscribe((nextValue) => {
      countStates.push(nextValue);
    });

    increment.invoke(store$);
    expect(countStates).toEqual([0, 1]);
    decrement.invoke(store$);
    expect(countStates).toEqual([0, 1, 0]);

    //async state receiver
    store$.epicOn((actor$) => {
      return actor$.pipe(
        filter(asyncIncrement.is),
        map(() => {
          return increment.with({});
        }),
      );
    });
    asyncIncrement.invoke(store$);
    expect(countStates).toEqual([0, 1, 0, 1]);
  });
});
