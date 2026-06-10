import { Card, CardContent } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

export const ScrollableCard: React.FunctionComponent<
  React.PropsWithChildren<{
    header: React.JSX.Element;
    footer?: React.JSX.Element;
    width?: number;
  }>
> = (props) => {
  const [showHeaderSeparator, setShowHeaderSeparator] = useState(false);
  const [showFooterSeparator, setShowFooterSeparator] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateSeparators = () => {
    const card = cardRef.current;
    const content = contentRef.current;
    if (!card || !content) {
      return;
    }

    setShowHeaderSeparator(card.scrollTop > 0);

    const contentBottom = content.offsetTop + content.scrollHeight;
    const visibleBottom = card.scrollTop + card.clientHeight;
    setShowFooterSeparator(contentBottom > visibleBottom);
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    card.addEventListener("scroll", updateSeparators);
    updateSeparators();

    return () => {
      card.removeEventListener("scroll", updateSeparators);
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSeparators();
    });
    resizeObserver.observe(content);

    return () => {
      resizeObserver.disconnect();
    };
  }, [props.children]);

  return (
    <Card
      ref={cardRef}
      style={{
        overflowY: "auto",
        maxHeight: "calc(100dvh - 78px)",
        width: props.width,
        WebkitOverflowScrolling: "touch",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 2,
          borderBottom: showHeaderSeparator
            ? "1px solid rgba(0, 0, 0, 0.12)"
            : "none",
        }}
      >
        {props.header}
      </div>
      <div ref={contentRef}>
        <CardContent style={{ paddingTop: "0px" }}>{props.children}</CardContent>
      </div>
      {props.footer && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            zIndex: 2,
            borderTop: showFooterSeparator
              ? "1px solid rgba(0, 0, 0, 0.12)"
              : "none",
          }}
        >
          {props.footer}
        </div>
      )}
    </Card>
  );
};
