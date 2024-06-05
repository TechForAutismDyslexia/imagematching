import React from "react";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagedisplay from "./Components/Imagedisplayer";
import Imagedisplayy from "./Components/withoutconfetti";
import Imagedisplayyy from "./Components/withbootstrap";
import "./Components/Imagedisplay.css";
const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Imagedisplay />} />
          <Route path="/wc" element={<Imagedisplayy />} />
          <Route path="/wb" element={<Imagedisplayyy />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;