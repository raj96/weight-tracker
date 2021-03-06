import "./tooltip.css";

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
  Typography,
  withTheme,
} from "@material-ui/core";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
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
import AppHeaderActions from "./app/components/views/AppScreen/AppHeaderActions";
import AddWeightForm from "./app/components/views/AddWeightForm";

var firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_APIKEY,
  authDomain: process.env.REACT_APP_FB_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FB_PROJECTID,
  storageBucket: process.env.REACT_APP_FB_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FB_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FB_APPID,
};

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
            date: doc.data()?.created_on?.toDate(),
          })
        );

        setWtData(
          data.sort((a, b) => a.created_on.seconds < b.created_on.seconds)
        );
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
          <AddWeightForm
            onClose={handleClose}
            user={user}
            firestore={firestore}
          />
        </Fade>
      </Modal>
    </ThemeProvider>
  );
}

function AppScreen({ user, onAddEntryClick, data, loading }) {
  const firstName = user?.displayName?.split(" ")[0];
  const [dataViewType, setDataViewType] = useState("graph");

  return (
    <Card elevation={0} style={{ width: "100vw", marginTop: "2%" }}>
      <CardHeader
        title={<Typography variant="h6">Welcome, {firstName}</Typography>}
      />
      <Divider />
      <CardContent>
        <AppHeaderActions
          dataViewType={dataViewType}
          setDataViewType={setDataViewType}
          onAddEntryClick={onAddEntryClick}
        />
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
                <Line type="monotone" dataKey="weight" fill="#000" />
                <Tooltip content={<ThemedToolTip />} />
                <CartesianGrid horizontal={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, theme }) {
  if (!active || !payload) return null;

  const { date, weight } = payload[0].payload;
  const [day, month, year] = date
    .toLocaleDateString("default", {
      month: "short",
      year: "numeric",
      day: "numeric",
    })
    .split(" ");
  const dateString = `${day}, ${month}/${year}`;

  return (
    <div className="tooltip-container">
      <div
        className="tooltip-header"
        style={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        {dateString}
      </div>
      <div className="tooltip-body">{weight} kg</div>
    </div>
  );
}

const ThemedToolTip = withTheme(CustomTooltip);

export default App;
