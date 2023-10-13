import { PromiseReject, PromiseResolve, PromiseUtils } from "@ironfish/sdk";

export type SplitPromise<T> = {
  promise: Promise<T>;
  resolve: PromiseResolve<T>;
  reject: PromiseReject;
};
export function splitPromise<T>(): SplitPromise<T> {
  const [promise, resolve, reject] = PromiseUtils.split<T>();
  return { promise, resolve, reject };
}
