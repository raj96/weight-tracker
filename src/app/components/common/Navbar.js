import { AppBar, Avatar, Button, Grid, Typography } from "@material-ui/core";
import { FitnessCenter } from "@material-ui/icons";

function Navbar({ onLogoutClick, user }) {
  const photoURL = user?.photoURL;
  return (
    <AppBar
      variant="elevation"
      style={{ padding: "0.75em" }}
      position="relative"
    >
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Grid
            container
            alignItems="center"
            spacing={1}
            style={{
              border: "0.2em solid white",
              borderRadius: "15px",
              padding: 2,
            }}
          >
            <Grid item>
              <FitnessCenter fontSize="large" />
            </Grid>
            <Grid item>
              <Typography variant="h5">Weight Tracker</Typography>
            </Grid>
          </Grid>
        </Grid>
        {user ? (
          <Grid item>
            <Grid container spacing={2}>
              <Grid item>
                <Avatar src={photoURL} />
              </Grid>
              <Grid item>
                <Button onClick={onLogoutClick}>
                  <Typography variant="button" style={{ color: "white" }}>
                    Logout
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </AppBar>
  );
}

export default Navbar;
