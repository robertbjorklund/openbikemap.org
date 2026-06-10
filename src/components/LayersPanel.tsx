import {
  Checkbox,
  Collapse,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Slider,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import MapFilters from "../MapFilters";
import {
  BIKE_ACTIVITY_LABELS,
  BikeActivity,
  MTB_SCALE_FILTER_LABELS,
  MTB_SCALE_FILTERS,
  ROUTE_PAVED_BUCKET_LABELS,
  ROUTE_PAVED_BUCKETS,
} from "../types/BikeActivity";
import { MtbScaleLegendIcon } from "./MtbScaleLegendIcon";
import { ROUTE_PAVED_BUCKET_COLORS } from "../types/RoutePavedColors";
import EventBus from "./EventBus";
import { PanelShell } from "./PanelShell";

export interface LayersPanelProps {
  eventBus: EventBus;
  mapFilters: MapFilters;
}

export const LayersPanel: React.FunctionComponent<LayersPanelProps> = (
  props,
) => {
  const isMtbEnabled = !props.mapFilters.hiddenActivities.includes(
    BikeActivity.Mtb,
  );
  const isRoutesEnabled = !props.mapFilters.hiddenActivities.includes(
    BikeActivity.Routes,
  );
  const initialMinLength = React.useRef(
    props.mapFilters.minTrailLengthMeters,
  ).current;

  return (
    <PanelShell title="Layers" onBack={() => props.eventBus.backToMenu()}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>MTB</strong> shows off-road trails.{" "}
          <strong>Bicycle routes</strong> are signed cycling routes from OSM
          relations (e.g. Sverigeleden).
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Activities
        </Typography>
        <FormGroup sx={{ pl: 1 }}>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isMtbEnabled}
                  onChange={() =>
                    props.eventBus.toggleActivity(BikeActivity.Mtb)
                  }
                />
              }
              label={BIKE_ACTIVITY_LABELS[BikeActivity.Mtb]}
            />
            <Collapse in={isMtbEnabled}>
              <FormGroup sx={{ pl: 3, pb: 0.5 }}>
                {MTB_SCALE_FILTERS.map((scale) => (
                  <FormControlLabel
                    key={scale}
                    sx={{ display: "flex", ml: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={
                          !props.mapFilters.hiddenMtbScales.includes(scale)
                        }
                        onChange={() => props.eventBus.toggleMtbScale(scale)}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MtbScaleLegendIcon scale={scale} />
                        <Typography variant="body2">
                          {MTB_SCALE_FILTER_LABELS[scale]}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Collapse>
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRoutesEnabled}
                  onChange={() =>
                    props.eventBus.toggleActivity(BikeActivity.Routes)
                  }
                />
              }
              label={BIKE_ACTIVITY_LABELS[BikeActivity.Routes]}
            />
            <Collapse in={isRoutesEnabled}>
              <Box sx={{ pl: 3, pb: 0.5 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Paved share
                </Typography>
                <FormGroup sx={{ pb: 0.5 }}>
                  {ROUTE_PAVED_BUCKETS.map((bucket) => (
                    <FormControlLabel
                      key={bucket}
                      sx={{ display: "flex", ml: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            !props.mapFilters.hiddenRoutePavedBuckets.includes(
                              bucket,
                            )
                          }
                          onChange={() =>
                            props.eventBus.toggleRoutePavedBucket(bucket)
                          }
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 4,
                              borderRadius: 1,
                              bgcolor: ROUTE_PAVED_BUCKET_COLORS[bucket],
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2">
                            {ROUTE_PAVED_BUCKET_LABELS[bucket]}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.5 }}
                >
                  Share of route length on paved surfaces. Routes without
                  surface data always show.
                </Typography>
              </Box>
            </Collapse>
          </Box>
        </FormGroup>

        {isMtbEnabled && (
          <Box sx={{ mt: 3, pl: 1 }}>
            <FormLabel component="legend">
              Minimum trail length (MTB exempt)
            </FormLabel>
            <Box sx={{ mx: 1, mt: 1 }}>
              <Slider
                defaultValue={initialMinLength}
                min={0}
                max={3000}
                step={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) =>
                  value === 0 ? "Off" : `${value} m`
                }
                onChangeCommitted={(_event, value) =>
                  props.eventBus.setMinTrailLength(value as number)
                }
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Hides short MTB segments without a name or ref.
            </Typography>
          </Box>
        )}
    </PanelShell>
  );
};
