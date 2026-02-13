import React from "react";
import { init as autoinit, unmount as autounmount } from "@moodle/lms/core/react_autoinit";

const REGION_ID = "local-reactdemo-autoinit-region";

/**
 * Demo component for the core/react_autoinit exposed APIs.
 *
 * @returns A JSX.Element representing the demo UI.
 */
export default function AutoInitApiDemo() {
    const [status, setStatus] = React.useState("Idle");
    const refreshCountRef = React.useRef(0);

    // Returns the region container where simulated fragment HTML is injected.
    const getRegion = (): HTMLElement | null => {
        return document.getElementById(REGION_ID);
    };

    // Builds mock fragment HTML with data-react-component placeholders.
    const getFragmentHtml = (fragmentrevision: number): string => {
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

    // Simulates server/fragment HTML injection before calling react_autoinit.init().
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

    // Mounts data-react-component nodes currently inside the region container.
    const handleInit = async() => {
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

    // Fully tears down demo state: unmount roots, clear region DOM, and reset revision.
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

    // Demonstrates recommended Moodle refresh lifecycle: unmount -> replace HTML -> init.
    const handleSafeRefresh = async () => {
        const region = getRegion();
        if (!region) {
            setStatus("Region element not found");
            return;
        }

        // Real workflow: before replacing a server fragment, cleanup old React roots first.
        autounmount(region);
        refreshCountRef.current += 1;
        region.innerHTML = getFragmentHtml(refreshCountRef.current);
        await autoinit(region);
        setStatus(`Safe refresh done for revision ${refreshCountRef.current} (unmount -> replace HTML -> init).`);
    };

    // Demonstrates risky refresh path where old roots are not explicitly unmounted.
    const handleUnsafeRefresh = async() => {
        const region = getRegion();
        if (!region) {
            setStatus("Region element not found");
            return;
        }

        // Appending a new fragment without cleanup.
        // This keeps older mounted components alive and visibly duplicates content.
        refreshCountRef.current += 1;
        region.insertAdjacentHTML("beforeend", `<hr class="my-3" />${getFragmentHtml(refreshCountRef.current)}`);
        await autoinit(region);
        setStatus(
            `Unsafe refresh revision ${refreshCountRef.current}: appended new fragment without cleanup; old components remain mounted.`
        );
    };

    return (
        <div>
            <strong>Moodle fragment refresh demo (react_autoinit)</strong>
            <div className="small text-muted mt-1 mb-2">
                <p>The react_autoinit exposes two public APIs: <code>init()</code> and <code>unmount()</code></p>
                <p>Purpose: demonstrate a recommended dynamic-region lifecycle.</p><p>
                The inject action intentionally uses raw HTML (<code>data-react-component</code> divs), not the Mustache
                <code>{"{{#react}}"}</code> helper, to mimic AJAX/server fragment responses.<br/>
                The fragment revision value is included to make each refresh visibly different, so you can confirm old
                content was replaced by a new fragment response.
                </p>
            </div>
            <div className="mt-2 mb-2">{status}</div>
            <div className="d-flex gap-2 mb-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={renderRawFragment}>
                    1) Inject fragment HTML
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleInit}>
                    2) Mount current fragment (init)
                </button>
                <button type="button" className="btn btn-warning btn-sm" onClick={handleUnsafeRefresh}>
                    3) Refresh without unmount
                </button>
                <button type="button" className="btn btn-success btn-sm" onClick={handleSafeRefresh}>
                    4) Safe refresh (unmount + init)
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleFullCleanup}>
                    5) Full cleanup
                </button>
            </div>
            <div id={REGION_ID} className="p-2 border rounded" />
        </div>
    );
}
