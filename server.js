const dotenv = require("dotenv");
// .env file configuration
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

// Connecting DataBase
const db = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db)
  .then(() => {
    console.log("connected to DB Succecfully");
  })
  .catch((err) => console.log(`Error while connecting the DB: ${err}`));

// running the application on port
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port:${port}`);
});
