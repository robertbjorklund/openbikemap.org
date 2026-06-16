import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Button } from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import { FeedbackDialog } from "./FeedbackDialog";
import { trackMatomoEvent } from "../utils/matomo";

export const BETA_BANNER_HEIGHT_PX = 44;

export const BetaBanner: React.FunctionComponent = () => {
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--beta-banner-height",
      `${BETA_BANNER_HEIGHT_PX}px`,
    );
    return () => {
      document.documentElement.style.removeProperty("--beta-banner-height");
    };
  }, []);

  const openFeedback = () => {
    trackMatomoEvent("Feedback", "Open");
    setFeedbackOpen(true);
  };

  return (
    <>
      <div className="beta-banner" role="status">
        <span className="beta-banner-text">
          <strong>{AppConfig.appName}</strong> is in beta — help us improve the
          map.
        </span>
        <Button
          className="beta-banner-feedback-button"
          variant="contained"
          size="small"
          startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />}
          onClick={openFeedback}
          sx={{
            flexShrink: 0,
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: AppConfig.betaAccentColor,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#C2185B", boxShadow: "none" },
          }}
        >
          Feedback
        </Button>
      </div>
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
};
