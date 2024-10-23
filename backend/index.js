const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const imageMatchingRoutes = require("./routes/gameapi")

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/imagematching')
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err=>{
    console.error('Failed to connecct',err);
});

app.use("/api",imageMatchingRoutes);
app.listen(5000, ()=> {
    console.log('Server running on port 5000');
});