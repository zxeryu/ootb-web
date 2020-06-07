import { isFunction, Dictionary, assign, forEach, map } from "lodash";
import React, { FunctionComponent, useState } from "react";
import { RequestActor } from "../request";
import { HTMLComment } from "../reactutils";
import { tap } from "rxjs/operators";
import { from } from "rxjs";
import { useAccessControl } from "./ctx";
import { useObservableEffect } from "../store";

export interface ShouldRender {
  (permissions: Dictionary<boolean>, attrs: Dictionary<string[]>): Promise<boolean>;

  ac?: Stringer;
}

export interface ShouldRenderable {
  shouldRender: ShouldRender;
}

export interface AccessControlFunctionComponent<P = {}> extends FunctionComponent<P>, ShouldRenderable {}

export const displayAc = (scope: string, isSome: boolean, acl: (string | undefined)[] = []): string => {
  return `${scope}(${acl.filter((v) => !!v).join(isSome ? " || " : " && ")})`;
};

export interface Stringer {
  toString(): string;
}

export const isAccessControlFunctionComponent = (c: any): c is AccessControlFunctionComponent => {
  return isFunction(c) && (c as any).shouldRender;
};

const shouldRenderFromRequestActor = (requestActor: RequestActor): ShouldRender => {
  const shouldRender: ShouldRender = (permissions: Dictionary<boolean>, _: Dictionary<string[]>) => {
    return Promise.resolve(permissions[requestActor.name]);
  };

  shouldRender.ac = {
    toString: () => requestActor.name,
  };

  return shouldRender;
};

const withAccessControl = (method: "some" | "every", ...deps: Array<RequestActor | ShouldRenderable>) => {
  const shouldRenders: ShouldRender[] = [];

  forEach(deps, (c, i) => {
    if (!c) {
      throw new Error(`invalid access control parameter $${i}`);
    }

    if (c instanceof RequestActor) {
      shouldRenders.push(shouldRenderFromRequestActor(c));
      return;
    }

    if (c.shouldRender) {
      shouldRenders.push(c.shouldRender);
    }
  });

  const isSome = method === "some";

  const createShouldRender = (scope: string) => {
    const shouldRender = async (permissions: Dictionary<boolean>, attrs: Dictionary<string[]>): Promise<boolean> => {
      if (isSome) {
        if (shouldRenders.length === 0) {
          return true;
        }

        for (const shouldRender of shouldRenders) {
          const can = await shouldRender(permissions, attrs);

          if (can) {
            return true;
          }
        }

        return false;
      }

      for (const shouldRender of shouldRenders) {
        const can = await shouldRender(permissions, attrs);

        if (!can) {
          return false;
        }
      }

      return true;
    };

    shouldRender.ac = {
      toString: () => {
        return displayAc(
          scope,
          isSome,
          map(shouldRenders, (shouldRender) => shouldRender.ac?.toString()),
        );
      },
    };

    return shouldRender;
  };

  return <TFn extends Function>(CompOrHook: TFn, isHook?: boolean, scope = "Ac"): TFn & ShouldRenderable => {
    const shouldRender = createShouldRender(scope);

    if (isHook) {
      return assign(CompOrHook, { shouldRender });
    }

    const AccessControl = (props: any): JSX.Element | null => {
      const { permissions, attrs } = useAccessControl();

      const [ready, setReady] = useState(false);

      useObservableEffect(() => {
        return from(shouldRender(permissions || {}, attrs || ({} as any))).pipe(
          tap((r) => {
            setReady(r);
          }),
        );
      }, [permissions, attrs]);

      return (
        <>
          {shouldRender.ac && <HTMLComment text={`${shouldRender.ac}`} />}
          {ready && <CompOrHook {...props} />}
        </>
      );
    };

    return assign(AccessControl as any, { shouldRender });
  };
};

export const mustOneOfPermissions = (...deps: Array<RequestActor | ShouldRenderable>) =>
  withAccessControl("some", ...deps);

export const mustAllOfPermissions = (...deps: Array<RequestActor | ShouldRenderable>) =>
  withAccessControl("every", ...deps);
