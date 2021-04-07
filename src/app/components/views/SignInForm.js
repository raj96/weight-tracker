import { Button, Grid, Paper, Typography } from "@material-ui/core";
import firebase from "firebase/app";

function SignInForm({ auth }) {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <Grid container justify="center">
      <Grid item>
        <Paper
          elevation={10}
          style={{
            height: "50vh",
            width: "50vw",
            marginTop: "10vh",
            padding: "1em",
          }}
        >
          <Typography variant="h4">Sign In</Typography>
          <Grid
            container
            direction="column"
            alignItems="center"
            style={{ marginTop: "20%" }}
          >
            <Grid item>
              <Button
                onClick={signInWithGoogle}
                variant="outlined"
                startIcon={
                  <img
                    alt="google-logo"
                    src="https://www.google.com/favicon.ico"
                  />
                }
              >
                Sign In With Google
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default SignInForm;
