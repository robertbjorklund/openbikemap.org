import * as React from "react";

export const OverflowScrollText: React.FunctionComponent<{
  children: string;
  className?: string;
  /** On touch devices, start marquee without a tap (e.g. mobile route header). */
  autoScroll?: boolean;
}> = ({ children, className, autoScroll = false }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) {
      return;
    }

    const distance = text.scrollWidth - container.clientWidth;
    const doesOverflow = distance > 1;
    setOverflows(doesOverflow);

    if (doesOverflow) {
      container.style.setProperty("--overflow-scroll-distance", `${distance}px`);
    } else {
      container.style.removeProperty("--overflow-scroll-distance");
      setActive(false);
    }
  }, []);

  React.useLayoutEffect(() => {
    measure();
  }, [children, measure]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  React.useEffect(() => {
    if (autoScroll) {
      setActive(overflows);
      return;
    }
    setActive(false);
  }, [autoScroll, overflows]);

  const toggleActive = () => {
    if (autoScroll || !overflows) {
      return;
    }
    setActive((prev) => !prev);
  };

  return (
    <span
      ref={containerRef}
      className={[
        "overflow-scroll-text",
        overflows ? "overflow-scroll-text--overflows" : "",
        active ? "overflow-scroll-text--active" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={autoScroll ? undefined : toggleActive}
      title={overflows ? children : undefined}
      role={overflows && !autoScroll ? "button" : undefined}
      tabIndex={overflows && !autoScroll ? 0 : undefined}
      onKeyDown={
        autoScroll
          ? undefined
          : (event) => {
              if (overflows && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                toggleActive();
              }
            }
      }
    >
      <span ref={textRef} className="overflow-scroll-text-inner">
        {children}
      </span>
    </span>
  );
};
