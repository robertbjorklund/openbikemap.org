import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import IosShareIcon from "@mui/icons-material/IosShare";
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import type { ObjectIDType } from "../AppConfig";
import { buildFeatureShareUrl } from "../utils/FeatureShareUrl";
import { PanelActionButton } from "./PanelActionButton";

interface Props {
  objectId: string;
  idType?: ObjectIDType;
  title: string;
}

export const FeatureShareMenu: React.FunctionComponent<Props> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [copied, setCopied] = React.useState(false);
  const shareUrl = buildFeatureShareUrl(props.objectId, props.idType);
  const canNativeShare =
    typeof navigator.share === "function" &&
    (typeof navigator.canShare !== "function" ||
      navigator.canShare({ url: shareUrl, title: props.title }));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      const input = document.createElement("textarea");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      return;
    }
    try {
      await navigator.share({
        title: props.title,
        text: props.title,
        url: shareUrl,
      });
      setAnchorEl(null);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error(error);
      }
    }
  };

  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`${props.title}\n${shareUrl}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(`${props.title}\n\n${shareUrl}`)}`;

  return (
    <>
      <PanelActionButton
        label="Share"
        icon={<ShareIcon />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      />

      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 300, p: 2 } } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Share link
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            value={shareUrl}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy link">
                      <IconButton size="small" onClick={copyLink} edge="end">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={copyLink}
          sx={{ mb: 1.5 }}
        >
          Copy link
        </Button>

        <Divider sx={{ mb: 1 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Share via
        </Typography>
        <List dense disablePadding>
          {canNativeShare && (
            <ListItemButton onClick={nativeShare}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <IosShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="More..." />
            </ListItemButton>
          )}
          <ListItemButton
            component="a"
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <WhatsAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="WhatsApp" />
          </ListItemButton>
          <ListItemButton component="a" href={emailUrl}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Email" />
          </ListItemButton>
        </List>
      </Popover>

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Link copied
        </Alert>
      </Snackbar>
    </>
  );
};
