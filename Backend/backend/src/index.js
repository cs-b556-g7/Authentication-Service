import expres from "express";
import zod from "zod";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

app.get("/" , (req , res)=>{
    res.send("Working ...");
});

app.listen(3000 , (req , res)=>{
    console.log("Server is Running on Port 3000");
}); 