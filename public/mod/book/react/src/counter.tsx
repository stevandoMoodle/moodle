// import { useState } from "react";
import { React } from "@moodle/core/react";

export function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
