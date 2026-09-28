require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/db/db");

const PORT = process.env.PORT || 7930;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});