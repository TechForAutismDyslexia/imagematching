import React from "react";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagedisplay from "./Components/Imagedisplayer";
import "./Components/Imagedisplay.css";
import Result from "./Components/Result";
const App = () => {

  return (
    <div>
      <Router basename="/games/matching">
        <Routes>
          <Route path="/" element={<Imagedisplay />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;