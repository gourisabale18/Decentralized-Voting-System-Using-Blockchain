import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { amber, deepOrange, grey, deepPurple } from "@mui/material/colors";

import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import { CssBaseline } from "@mui/material";
import Navbar from "./scenes/navbar";
import LandingPage from "./scenes/landingpage";
import Home from "@/scenes/home";

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      ...deepPurple,
      ...(mode === "dark" && {
        main: amber[300],
      }),
    },
    ...(mode === "dark" && {
      background: {
        default: deepOrange[900],
        paper: deepOrange[900],
      },
    }),
    text: {
      ...(mode === "light"
        ? {
            primary: grey[900],
            secondary: grey[800],
          }
        : {
            primary: "#fff",
            secondary: grey[500],
          }),
    },
  },
});

const darkModeTheme = createTheme(getDesignTokens("light"));

function App() {
  return (
    <ThemeProvider theme={darkModeTheme}>
      <div className="app">
        <BrowserRouter>
          <CssBaseline />
          <div>
            <Routes>
              <Route path="/" element={<div></div>} />
              <Route path="/*" element={<Navbar />} />
            </Routes>
          </div>
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
