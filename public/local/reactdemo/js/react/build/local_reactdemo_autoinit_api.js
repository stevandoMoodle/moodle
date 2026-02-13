// public/local/reactdemo/js/react/src/local_reactdemo_autoinit_api.tsx
import React from "react";
import { init as autoinit, unmount as autounmount } from "@moodle/lms/core/react_autoinit";
var REGION_ID = "local-reactdemo-autoinit-region";
function AutoInitApiDemo() {
  const [status, setStatus] = React.useState("Idle");
  const refreshCountRef = React.useRef(0);
  const getRegion = () => {
    return document.getElementById(REGION_ID);
  };
  const getFragmentHtml = (fragmentrevision) => {
    return `
            <div class="small text-muted mb-2">
                Simulated Moodle fragment (e.g. refreshed course panel), revision: <strong>${fragmentrevision}</strong>
            </div>
            <div
                data-react-component="@local_reactdemo/local_reactdemo_message"
                data-react-props='{"message":"Fragment revision ${fragmentrevision} mounted with react_autoinit.init()"}'
                class="p-2 border rounded mb-2"
            >
                Fallback: message component
            </div>
            <div
                data-react-component="@local_reactdemo/local_reactdemo_counter"
                data-react-props='{"initial":${fragmentrevision}}'
                class="p-2 border rounded mb-2"
            >
                Fallback: counter component
            </div>
            <div class="small text-muted mb-2">
                Note: this counter keeps local React state only. After a fragment refresh/remount, it resets to the new
                initial value from fragment props (revision).
            </div>
            <div
                data-react-component="@local_reactdemo/local_reactdemo_button"
                data-react-props='{"label":"Open popup","message":"Revision ${fragmentrevision}: popup from mounted fragment button"}'
                class="p-2 border rounded"
            >
                Fallback: button component
            </div>
        `;
  };
  const renderRawFragment = () => {
    const region = getRegion();
    if (!region) {
      setStatus("Region element not found");
      return;
    }
    refreshCountRef.current += 1;
    region.innerHTML = getFragmentHtml(refreshCountRef.current);
    setStatus(`Raw fragment HTML injected (revision ${refreshCountRef.current}). Click init() to mount.`);
  };
  const handleInit = async () => {
    const region = getRegion();
    if (!region) {
      setStatus("Region element not found");
      return;
    }
    await autoinit(region);
    const totalNodes = region.querySelectorAll("[data-react-component]").length;
    const mountedCount = region.querySelectorAll('[data-react-mounted="1"]').length;
    setStatus(`Mounted ${mountedCount}/${totalNodes} nodes in current fragment.`);
  };
  const handleFullCleanup = () => {
    const region = getRegion();
    if (region) {
      autounmount(region);
      region.innerHTML = "";
    } else {
      autounmount(`#${REGION_ID}`);
    }
    refreshCountRef.current = 0;
    setStatus("Unmounted roots, cleared host, and reset fragment revision.");
  };
  const handleSafeRefresh = async () => {
    const region = getRegion();
    if (!region) {
      setStatus("Region element not found");
      return;
    }
    autounmount(region);
    refreshCountRef.current += 1;
    region.innerHTML = getFragmentHtml(refreshCountRef.current);
    await autoinit(region);
    setStatus(`Safe refresh done for revision ${refreshCountRef.current} (unmount -> replace HTML -> init).`);
  };
  const handleUnsafeRefresh = async () => {
    const region = getRegion();
    if (!region) {
      setStatus("Region element not found");
      return;
    }
    refreshCountRef.current += 1;
    region.insertAdjacentHTML("beforeend", `<hr class="my-3" />${getFragmentHtml(refreshCountRef.current)}`);
    await autoinit(region);
    setStatus(
      `Unsafe refresh revision ${refreshCountRef.current}: appended new fragment without cleanup; old components remain mounted.`
    );
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Moodle fragment refresh demo (react_autoinit)"), /* @__PURE__ */ React.createElement("div", { className: "small text-muted mt-1 mb-2" }, /* @__PURE__ */ React.createElement("p", null, "The react_autoinit exposes two public APIs: ", /* @__PURE__ */ React.createElement("code", null, "init()"), " and ", /* @__PURE__ */ React.createElement("code", null, "unmount()")), /* @__PURE__ */ React.createElement("p", null, "Purpose: demonstrate a recommended dynamic-region lifecycle."), /* @__PURE__ */ React.createElement("p", null, "The inject action intentionally uses raw HTML (", /* @__PURE__ */ React.createElement("code", null, "data-react-component"), " divs), not the Mustache", /* @__PURE__ */ React.createElement("code", null, "{{#react}}"), " helper, to mimic AJAX/server fragment responses.", /* @__PURE__ */ React.createElement("br", null), "The fragment revision value is included to make each refresh visibly different, so you can confirm old content was replaced by a new fragment response.")), /* @__PURE__ */ React.createElement("div", { className: "mt-2 mb-2" }, status), /* @__PURE__ */ React.createElement("div", { className: "d-flex gap-2 mb-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary btn-sm", onClick: renderRawFragment }, "1) Inject fragment HTML"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-primary btn-sm", onClick: handleInit }, "2) Mount current fragment (init)"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-warning btn-sm", onClick: handleUnsafeRefresh }, "3) Refresh without unmount"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-success btn-sm", onClick: handleSafeRefresh }, "4) Safe refresh (unmount + init)"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary btn-sm", onClick: handleFullCleanup }, "5) Full cleanup")), /* @__PURE__ */ React.createElement("div", { id: REGION_ID, className: "p-2 border rounded" }));
}
export {
  AutoInitApiDemo as default
};
//# sourceMappingURL=local_reactdemo_autoinit_api.js.map
