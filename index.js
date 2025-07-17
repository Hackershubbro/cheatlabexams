require('dotenv').config();
const app = require("express")()
const DataBaseRoutes = require("./routes/DataBaseRouters")
const bodyParser = require('body-parser');

require("./config/db")

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", DataBaseRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please check the URL and try again.",
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      "GET /api/data", 
      "POST /api/data", 
      "DELETE /api/data"
    ]
  })
})
const port = process.env.PORT

app.listen(port, () => {
    console.log("server has been started", port)
})
