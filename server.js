const dotenv = require("dotenv");
const app = require("./app");

// .env file configuration
dotenv.config({ path: "./config.env" });

// running the application on port
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port:${port}`);
});
