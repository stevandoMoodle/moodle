var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// public/local/reactdemo/js/react/src/helper.ts
function requireAmd(mod) {
  return new Promise((resolve, reject) => {
    __require([mod], resolve, reject);
  });
}
__name(requireAmd, "requireAmd");
export {
  requireAmd as default
};
//# sourceMappingURL=helper.js.map
