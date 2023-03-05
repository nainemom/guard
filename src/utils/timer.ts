import CancelablePromise from "cancelable-promise";

export const wait = (time: number) => new CancelablePromise((resolve, _reject, onCancel) => {
  let timer = setTimeout(resolve, time);
  onCancel(() => {
    clearTimeout(timer);
  });
});