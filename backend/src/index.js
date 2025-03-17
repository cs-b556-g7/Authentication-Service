import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import loginRoute from "./routes/login.js";  // Add .js at the end

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/login" , loginRoute);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});