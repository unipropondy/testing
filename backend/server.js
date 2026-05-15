require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbMiddleware = require("./middleware/dbMiddleware");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Dynamic DB Middleware (applies to all routes except save-config inside the middleware)
app.use(dbMiddleware);

// Routes
app.use("/api", authRoutes);
app.use("/", orderRoutes);
app.use("/api", configRoutes);

app.get("/", (req, res) => {
  res.send("CDS Backend API Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
