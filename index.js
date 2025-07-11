const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");
const cors = require("cors");

const app = express();
const PORT = 5500;
app.use(cors());
app.use(bodyParser.json());

app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"))
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
