import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { AppConfig } from "../AppConfig";
import {
  buildFeedbackGitHubIssueUrl,
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "../utils/feedbackIssueUrl";
import { trackMatomoEvent } from "../utils/matomo";

export const FeedbackDialog: React.FunctionComponent<{
  open: boolean;
  onClose: () => void;
}> = (props) => {
  const [category, setCategory] = React.useState<FeedbackCategory>("bug");
  const [message, setMessage] = React.useState("");

  const handleClose = () => {
    props.onClose();
  };

  const handleSubmit = () => {
    if (message.trim().length === 0) {
      return;
    }

    trackMatomoEvent("Feedback", "Submit", category);
    window.open(buildFeedbackGitHubIssueUrl(category, message), "_blank", "noopener,noreferrer");
    setMessage("");
    setCategory("bug");
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="feedback-dialog-title"
    >
      <DialogTitle
        id="feedback-dialog-title"
        sx={{ display: "flex", alignItems: "center", pr: 1 }}
      >
        Leave feedback
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          sx={{ ml: "auto" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflow: "visible",
        }}
      >
        <Box>
          <Typography
            component="label"
            htmlFor="feedback-category"
            variant="body2"
            sx={{ display: "block", mb: 1, fontWeight: 600 }}
          >
            Type
          </Typography>
          <TextField
            id="feedback-category"
            select
            size="small"
            fullWidth
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as FeedbackCategory)
            }
          >
            {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map(
              (key) => (
                <MenuItem key={key} value={key}>
                  {FEEDBACK_CATEGORY_LABELS[key]}
                </MenuItem>
              ),
            )}
          </TextField>
        </Box>
        <TextField
          label="Describe your feedback"
          placeholder="Describe your feedback…"
          multiline
          minRows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={message.trim().length === 0}
          startIcon={<ChatBubbleOutlineIcon />}
          sx={{
            backgroundColor: AppConfig.betaAccentColor,
            "&:hover": { backgroundColor: "#C2185B" },
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};
