import { Button, ButtonGroup, Grid, Tooltip } from "@material-ui/core";
import { AddBox, TableChart, Timeline } from "@material-ui/icons";

function AppHeader({ dataViewType, setDataViewType, onAddEntryClick }) {
  return (
    <Grid container spacing={8}>
      <Grid item>
        <ButtonGroup disableElevation disableRipple variant="contained">
          <Tooltip title="Tabular View">
            <Button
              color={dataViewType === "chart" ? "primary" : "default"}
              onClick={() => setDataViewType("chart")}
            >
              <TableChart />
            </Button>
          </Tooltip>
          <Tooltip title="Graph View">
            <Button
              color={dataViewType === "graph" ? "primary" : "default"}
              onClick={() => setDataViewType("graph")}
            >
              <Timeline />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
      <Grid item>
        <Button variant="text" startIcon={<AddBox />} onClick={onAddEntryClick}>
          Add entry
        </Button>
      </Grid>
    </Grid>
  );
}

export default AppHeader;
