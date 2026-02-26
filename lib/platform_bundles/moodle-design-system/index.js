import * as v from "react";
import { useContext as b } from "react";
function C(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var x = { exports: {} }, c = {};
var y;
function O() {
  if (y) return c;
  y = 1;
  var n = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function r(i, s, t) {
    var o = null;
    if (t !== void 0 && (o = "" + t), s.key !== void 0 && (o = "" + s.key), "key" in s) {
      t = {};
      for (var u in s)
        u !== "key" && (t[u] = s[u]);
    } else t = s;
    return s = t.ref, {
      $$typeof: n,
      type: i,
      key: o,
      ref: s !== void 0 ? s : null,
      props: t
    };
  }
  return c.Fragment = e, c.jsx = r, c.jsxs = r, c;
}
var j;
function B() {
  return j || (j = 1, x.exports = O()), x.exports;
}
var R = B(), m = { exports: {} };
var E;
function w() {
  return E || (E = 1, (function(n) {
    (function() {
      var e = {}.hasOwnProperty;
      function r() {
        for (var t = "", o = 0; o < arguments.length; o++) {
          var u = arguments[o];
          u && (t = s(t, i(u)));
        }
        return t;
      }
      function i(t) {
        if (typeof t == "string" || typeof t == "number")
          return t;
        if (typeof t != "object")
          return "";
        if (Array.isArray(t))
          return r.apply(null, t);
        if (t.toString !== Object.prototype.toString && !t.toString.toString().includes("[native code]"))
          return t.toString();
        var o = "";
        for (var u in t)
          e.call(t, u) && t[u] && (o = s(o, u));
        return o;
      }
      function s(t, o) {
        return o ? t ? t + " " + o : t + o : t;
      }
      n.exports ? (r.default = r, n.exports = r) : window.classNames = r;
    })();
  })(m)), m.exports;
}
var A = w();
const h = /* @__PURE__ */ C(A), k = ["xxl", "xl", "lg", "md", "sm", "xs"], S = "xs", P = /* @__PURE__ */ v.createContext({
  prefixes: {},
  breakpoints: k,
  minBreakpoint: S
}), {
  Consumer: L,
  Provider: M
} = P;
function $(n, e) {
  const {
    prefixes: r
  } = b(P);
  return n || r[e] || e;
}
const D = ["as", "disabled"];
function q(n, e) {
  if (n == null) return {};
  var r = {};
  for (var i in n) if ({}.hasOwnProperty.call(n, i)) {
    if (e.indexOf(i) >= 0) continue;
    r[i] = n[i];
  }
  return r;
}
function N(n) {
  return !n || n.trim() === "#";
}
function _({
  tagName: n,
  disabled: e,
  href: r,
  target: i,
  rel: s,
  role: t,
  onClick: o,
  tabIndex: u = 0,
  type: p
}) {
  n || (r != null || i != null || s != null ? n = "a" : n = "button");
  const l = {
    tagName: n
  };
  if (n === "button")
    return [{
      type: p || "button",
      disabled: e
    }, l];
  const f = (a) => {
    if ((e || n === "a" && N(r)) && a.preventDefault(), e) {
      a.stopPropagation();
      return;
    }
    o?.(a);
  }, d = (a) => {
    a.key === " " && (a.preventDefault(), f(a));
  };
  return n === "a" && (r || (r = "#"), e && (r = void 0)), [{
    role: t ?? "button",
    // explicitly undefined so that it overrides the props disabled in a spread
    // e.g. <Tag {...props} {...hookProps} />
    disabled: void 0,
    tabIndex: e ? void 0 : u,
    href: r,
    target: n === "a" ? i : void 0,
    "aria-disabled": e || void 0,
    rel: n === "a" ? s : void 0,
    onClick: f,
    onKeyDown: d
  }, l];
}
const F = /* @__PURE__ */ v.forwardRef((n, e) => {
  let {
    as: r,
    disabled: i
  } = n, s = q(n, D);
  const [t, {
    tagName: o
  }] = _(Object.assign({
    tagName: r,
    disabled: i
  }, s));
  return /* @__PURE__ */ R.jsx(o, Object.assign({}, s, t, {
    ref: e
  }));
});
F.displayName = "Button";
const T = /* @__PURE__ */ v.forwardRef(({
  as: n,
  bsPrefix: e,
  variant: r = "primary",
  size: i,
  active: s = !1,
  disabled: t = !1,
  className: o,
  ...u
}, p) => {
  const l = $(e, "btn"), [f, {
    tagName: d
  }] = _({
    tagName: n,
    disabled: t,
    ...u
  }), a = d;
  return /* @__PURE__ */ R.jsx(a, {
    ...f,
    ...u,
    ref: p,
    disabled: t,
    className: h(o, l, s && "active", r && `${l}-${r}`, i && `${l}-${i}`, u.href && t && "disabled")
  });
});
T.displayName = "Button";
const J = [
  "primary",
  "secondary",
  "danger",
  "outline-primary",
  "outline-secondary",
  "outline-danger"
], V = ({ label: n, variant: e, ...r }) => {
  const i = J.includes(e ?? "") ? e : "primary";
  return /* @__PURE__ */ R.jsx(T, { className: "mds-btn", variant: i, ...r, children: n });
};
export {
  V as Button
};
//# sourceMappingURL=index.es.js.map
