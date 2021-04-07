import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  withTheme,
} from "@material-ui/core";
import { Check, Close } from "@material-ui/icons";
import { useState } from "react";

import firebase from "firebase/app";

function AddWeightForm({ onClose, theme, user, firestore }) {
  const addEntry = () => {
    if (weight === undefined || weight.replaceAll("\\s", "").length === 0)
      return;

    const inserted = firestore
      .collection("weights")
      .doc(user.uid)
      .collection("weight")
      .add({
        weight: weight,
        created_on: firebase.firestore.FieldValue.serverTimestamp(),
      });

    inserted.then(onClose).catch(() => {
      alert("Data not inserted");
    });
  };
  const [weight, setWeight] = useState(undefined);
  return (
    <Card style={{ flex: 0.5 }}>
      <CardHeader
        style={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
        title="Add Entry"
        action={
          <IconButton onClick={onClose}>
            <Close
              htmlColor={theme.palette.primary.contrastText}
              fontSize="small"
            />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <TextField
          onChange={(e) => setWeight(e.target.value)}
          fullWidth
          type="number"
          label="Enter weight"
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="button">Kg</Typography>
              </InputAdornment>
            ),
          }}
        />
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="text"
          disableRipple
          fullWidth
          onClick={addEntry}
          style={{ backgroundColor: "transparent" }}
        >
          <Check fontSize="large" />
        </Button>
      </CardActions>
    </Card>
  );
}

export default withTheme(AddWeightForm);
