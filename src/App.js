import {
  Backdrop,
  Card,
  CardContent,
  CardHeader,
  createMuiTheme,
  Divider,
  Fade,
  Grid,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Delete } from "@material-ui/icons";
import { red } from "@material-ui/core/colors";

import { useEffect, useState } from "react";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";

import Navbar from "./app/components/common/Navbar";
import SignInForm from "./app/components/views/SignInForm";
import AppHeader from "./app/components/views/AppScreen/AppHeader";
import AddWeightForm from "./app/components/views/AddWeightForm";

var firebaseConfig = {};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [wtData, setWtData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    const unsubscribe = firestore
      .collection("weights")
      .doc(user?.uid)
      .collection("weight")
      .onSnapshot((snapShot) => {
        setLoading(true);
        const data = [];
        snapShot.forEach((doc) =>
          data.push({
            ...doc.data(),
            docID: doc.id,
            date: doc.data().created_on.toDate(),
          })
        );
        setWtData(data);
        setLoading(false);
      });
    return unsubscribe;
  }, [user]);

  const theme = createMuiTheme({
    palette: {
      primary: {
        main: red[900],
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Navbar onLogoutClick={() => auth.signOut()} user={user} />
      <Grid container justify="center">
        <Grid item>
          {user ? (
            <AppScreen
              user={user}
              onAddEntryClick={handleOpen}
              data={wtData}
              loading={loading}
            />
          ) : (
            !authLoading && <SignInForm auth={auth} />
          )}
        </Grid>
      </Grid>
      <Modal
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        open={modalOpen}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <AddWeightForm onClose={handleClose} user={user} />
        </Fade>
      </Modal>
    </ThemeProvider>
  );
}

function AppScreen({ user, onAddEntryClick, data, loading }) {
  const firstName = user?.displayName?.split(" ")[0];
  const [dataViewType, setDataViewType] = useState("graph");

  return (
    <Card style={{ width: "70vw", marginTop: "2%" }}>
      <CardHeader
        title={<Typography variant="h5">Welcome, {firstName}</Typography>}
        action={
          <AppHeader
            dataViewType={dataViewType}
            setDataViewType={setDataViewType}
            onAddEntryClick={onAddEntryClick}
          />
        }
      />
      <Divider />
      <CardContent>
        {dataViewType === "chart" && (
          <TableContainer>
            <Table
              style={{
                minHeight: loading ? "30vh" : "0vh",
                maxHeight: "60vh",
                width: "100%",
              }}
            >
              <TableHead>
                <TableRow>
                  {["Date", "Weight (kg)"].map((value, index) => (
                    <TableCell
                      component="th"
                      scope="row"
                      key={index}
                      align="center"
                    >
                      <b>{value}</b>
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Typography
                        variant="h6"
                        style={{
                          fontStyle: "italic",
                          color: "#AAA",
                          fontWeight: "lighter",
                        }}
                      >
                        Loading...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">
                        {new Date(row?.created_on?.toDate()).toDateString()}
                      </TableCell>
                      <TableCell align="center">{row.weight}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() =>
                            firestore
                              .collection("weights")
                              .doc(user.uid)
                              .collection("weight")
                              .doc(row.docID)
                              .delete()
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {dataViewType === "graph" && (
          <div style={{ width: "100%", height: "50vh" }}>
            <ResponsiveContainer>
              <LineChart data={data} width="100%" height="400px">
                <CartesianGrid />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => {
                    if (tick.toLocaleDateString !== undefined)
                      return tick.toLocaleDateString();
                  }}
                />
                <YAxis
                  label={{
                    value: "Weight (kg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Line dataKey="weight" fill="#000" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default App;
