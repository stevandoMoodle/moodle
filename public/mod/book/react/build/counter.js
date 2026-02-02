var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// public/mod/book/react/src/counter.tsx
import { React } from "../../../../lib/react/build/react.js";
function Counter() {
  const [count, setCount] = React.useState(0);
  return /* @__PURE__ */ React.createElement("button", { onClick: () => setCount((c) => c + 1) }, "Count: ", count);
}
__name(Counter, "Counter");
export {
  Counter
};
//# sourceMappingURL=counter.js.map
