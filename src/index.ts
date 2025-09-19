import { configureExpress } from "./config/express";
import express from "express";
import cors from "cors";
import { errorHandler } from "@/middlewares/errorHandler";
import router from "./routes";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(cors());

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

configureExpress(app);

// for error handling
app.use(errorHandler);
// importing the routes
app.use("/shopery", router);

setupSwagger(app);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
