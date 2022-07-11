let throttle = (function () {
  let throttle = false;

  return function (
    callback: (...args: Array<unknown>) => unknown,
    timeout: number,
    ...param: Array<unknown>
  ) {
    if (!throttle) {
      setTimeout(() => {
        callback(...param);
        throttle = false;
      }, timeout);
    }
  };
})();

export { throttle };
