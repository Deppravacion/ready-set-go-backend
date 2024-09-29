import express from "express";
import "express-async-errors";
import { userController } from "./router/user.router";
import { authController } from "./router/auth.router";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(authController);

app.listen(3000);
