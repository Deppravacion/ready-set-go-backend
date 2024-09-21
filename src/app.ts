import express from "express";
import "express-async-errors";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000);
