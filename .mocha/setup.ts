import { cleanup } from "@testing-library/react";

(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);

export const mochaHooks = {
  afterEach() {
    cleanup();
  }
};
