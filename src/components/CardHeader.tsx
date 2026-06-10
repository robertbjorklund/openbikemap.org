import { styled } from "@mui/material/styles";
import * as React from "react";
import { TopRightCloseButton } from "./CloseButton";

const Root = styled("div")({
  position: "sticky",
  top: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  background: "white",
  zIndex: 1,
});

const Content = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(2),
}));

export const CardHeader: React.FunctionComponent<
  React.PropsWithChildren<{
    onClose: () => void;
  }>
> = (props) => {
  return (
    <Root>
      <Content>{props.children}</Content>
      <TopRightCloseButton onClick={props.onClose} />
    </Root>
  );
};
