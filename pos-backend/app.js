const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || config.port;

connectDB();

// Middlewares
app.use(cors({
    credentials: true,
    origin: true
}));

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1);

// Root Endpoint
app.get("/", (req,res) => {
    res.json({message : "Hello from POS Server!"});
});

// Routes
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));

// Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
    console.log(`☑️ POS Server is listening on port ${PORT}`);
});