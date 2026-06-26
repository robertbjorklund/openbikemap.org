import { Box, Link, Typography } from "@mui/material";
import * as React from "react";
import type { RouteFeature } from "../types/FeatureTypes";
import { formatRouteDisplayTitle } from "../types/RouteNetwork";
import { formatLength, getFeatureLengthMeters } from "../utils/Length";
import { formatRouteStageLabel } from "../utils/RouteStage";
import type { UnitSystem } from "./utils/UnitHelpers";
import { useUnitSystem } from "./UnitSystemManager";
import type EventBus from "./EventBus";
import type { RouteGroupSelection } from "./SelectedObject";

export const RouteStageList: React.FunctionComponent<{
  routeGroup: RouteGroupSelection;
  eventBus: EventBus;
}> = ({ routeGroup, eventBus }) => {
  const unitSystem = useUnitSystem();

  return (
    <Box component="nav" sx={{ mb: 1.5 }} aria-label="Route stages">
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {routeGroup.stageFeatures.length} stages
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {routeGroup.stageFeatures.map((stage) => (
          <RouteStageListItem
            key={stage.properties.stageId ?? stage.properties.id}
            stage={stage}
            isActive={routeGroup.activeStageId === stage.properties.stageId}
            unitSystem={unitSystem}
            onSelect={() => {
              const stageId = stage.properties.stageId;
              if (stageId) {
                eventBus.selectRouteStage(stageId);
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

function RouteStageListItem({
  stage,
  isActive,
  unitSystem,
  onSelect,
}: {
  stage: RouteFeature;
  isActive: boolean;
  unitSystem: UnitSystem;
  onSelect: () => void;
}) {
  const { properties } = stage;
  const title = formatRouteDisplayTitle(properties.name, properties.ref);
  const detail = formatRouteStageLabel(properties);
  const length = formatLength(getFeatureLengthMeters(stage), unitSystem);
  const secondary = [detail, length].filter(Boolean).join(" · ");

  return (
    <Box component="li">
      <Link
        component="button"
        variant="body2"
        onClick={onSelect}
        sx={{
          cursor: "pointer",
          fontWeight: isActive ? 600 : 400,
          textAlign: "left",
        }}
      >
        {title || "Stage"}
      </Link>
      {secondary && (
        <Typography variant="caption" color="text.secondary" display="block">
          {secondary}
        </Typography>
      )}
    </Box>
  );
}
