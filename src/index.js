const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());

const booksRouter = require("./routers/books");
const petsRouter = require("./routers/pets");

app.use("/books", booksRouter);
app.use("/pets", petsRouter);

const port = 3030;
const db = require("./utils/database");

app.listen(port, () => {
  db.connect((error) => {
    if (error) {
      console.error("[ERROR] Connection error: ", error.stack);
    } else {
      console.log("\n[DB] Connected...\n");
    }
  });

  console.log(`[SERVER] Running on http://localhost:${port}/`);
});
