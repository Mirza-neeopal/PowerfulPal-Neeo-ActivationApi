import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

import registerappusers from "./routes/registerappusers.routes";

class App {
  public app: Application;
  public serviceName: string = "Api/NearByMe";

  constructor() {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeHealthCheck();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(cors({ credentials: true, origin: true }));
    this.app.use(bodyParser.json({ limit: "5mb" }));
    this.app.use(bodyParser.json());
  }

  private initializeRoutes() {
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
    this.app.use(`/${this.serviceName}`, registerappusers);
  }

  private initializeHealthCheck() {
    this.app.use("/health", (request: Request, response: Response) => {
      response.json({ status: "Service is up and running" });
    });
  }

  private initializeErrorHandling() {
    // Error handling middleware
    this.app.use(
      (
        error: Error,
        request: Request,
        response: Response,
        next: NextFunction
      ) => {
        response.status(500).send({ error: error.message });
      }
    );

    // catch 404 and forward to error handler
    this.app.use((request: Request, response: Response, next: NextFunction) => {
      response.status(404).send({ error: "invalid call!" });
    });
  }
}

export default App;