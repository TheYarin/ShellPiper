import React, { HTMLProps, useEffect, useRef } from "react";
import Mousetrap from "mousetrap";

export default function MousetrapWrapper({
  shortcutsAndHandlers,
  ...rest
}: {
  shortcutsAndHandlers: [string | string[], () => void][];
} & HTMLProps<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) throw new Error("This shouldn't happen, `ref.current` shouldn't be null once the component is mounted.");

    const mousetrap = Mousetrap(ref.current);

    for (const [shortcut, handler] of shortcutsAndHandlers) {
      mousetrap.bind(shortcut, handler);
    }

    return () => {
      for (const [shortcut, _handler] of shortcutsAndHandlers) {
        mousetrap.unbind(shortcut);
      }
    };
  });
  return <div ref={ref} tabIndex={-1} {...rest} />; // tabIndex is set so shortcuts will work on all children and not only focusable ones. A value of -1 was chosen so it won't actually mess with the tab order.
}
