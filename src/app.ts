import express from "express";
import cors from "cors";
import "express-async-errors";
import { userController } from "./router/user.router";
import { authController } from "./router/auth.router";
import { storeController } from "./router/stores.router";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(authController);
app.use(storeController);
app.use(cors);

app.listen(3000);
