let throttle = (function () {
  let throttle = false;

  return function (callback, timeout, ...param) {
    if (!throttle) {
      throttle = setTimeout(() => {
        callback(...param);
        throttle = false;
      }, timeout)
    }
  }
})();



export { throttle }