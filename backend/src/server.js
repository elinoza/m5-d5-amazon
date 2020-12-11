const express = require("express")
const cors = require("cors")
const ListEndPoints= require("express-list-endpoints")
const {join}= require("path")
// const ProductRouter = require("./services/products")

// const ReviewsRouter = require ("./services/reviews")

const {
    notFoundHandler,
    unauthorizedHandler,
    forbiddenHandler,
    badRequestHandler,
    catchAllHandler,
  } = require("./errorHandling.js");
  
  const server = express();
  const port = process.env.PORT || 4001 ;

  const publicFolderPath = join(__dirname, "../public")

  server.use(express.json());

//   server.use("/products", ProductRouter);
//   server.use("/reviews", ReviewsRouter);
  server.use(cors())
  console.log(ListEndPoints(server))
  server.use(notFoundHandler);
  server.use(unauthorizedHandler);
  server.use(forbiddenHandler);
  server.use(badRequestHandler);
  server.use(catchAllHandler);
  
  server.listen(port, () => {
    console.log("port is : ", port);
  });