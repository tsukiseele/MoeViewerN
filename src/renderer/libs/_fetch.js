import fetch from "node-fetch";

(function(fetch) {
  return function(url, options) {
    var abort = null;
    var abort_promise = new Promise((resolve, reject) => {
      abort = () => {
        reject("abort.");
        console.info("abort done.");
      };
    });
    var promise = Promise.race([fetch(url, options), abort_promise]);
    promise.abort = abort;
    return promise;
  };
})(fetch);
