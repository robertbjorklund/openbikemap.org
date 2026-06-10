import { Link, Typography } from "@mui/material";
import * as React from "react";
import { SourceType, type Source } from "../types/FeatureTypes";
import { osmBrowseUrl } from "../utils/OsmUrls";

export const SourceSummary: React.FunctionComponent<{ sources: Source[] }> = (
  props,
) => {
  if (props.sources.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Source: OpenStreetMap (tile data)
      </Typography>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary">
      Source:{" "}
      {props.sources.map((source, index) => (
        <span key={source.id}>
          {source.type === SourceType.OpenStreetMap ? (
            <Link href={osmBrowseUrl(source.id)} target="_blank" rel="noopener">
              OpenStreetMap
            </Link>
          ) : (
            source.type
          )}
          {index !== props.sources.length - 1 ? ", " : ""}
        </span>
      ))}
    </Typography>
  );
};
