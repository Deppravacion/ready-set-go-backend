import express from "express";
import cors from "cors";
import "express-async-errors";
import { userController } from "./router/user.router";
import { authController } from "./router/auth.router";
import { storeController } from "./router/stores.router";
import { itemsController } from "./router/items.router";
import { favoritesController } from "./router/favorites.router";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.options("*", cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(authController);
app.use(storeController);
app.use(userController);
app.use(itemsController);
app.use(favoritesController);

app.listen(3000);
