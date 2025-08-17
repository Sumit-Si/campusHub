import dotenv from "dotenv";
import app from "./app.js";
import { dbConnect } from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 4000;

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("mongodb connection error", error);
  });
