import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan";
import router from "../routes/index.routes.js";
import proxy from 'express-http-proxy';

export function createApp() {
  let app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.use((req:Request,res:Response,next:NextFunction) => {

    // xyz.localhost
    const host = req.headers.host || ""
    const subdomain = host.split(".")

    if(!subdomain[1]){
      return next()
    }

    const uniqueId = subdomain[0];

    proxy(`http://nextjs-service-${uniqueId}`,{
      proxyReqPathResolver: (req) => req.originalUrl
    })(req,res,next)
  })

  app.use("/api/projects", router);

  app.get("/_status/healthz", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Server is Healthy",
    });
  });

  app.get("/_status/readyz", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Server is Healthy",
    });
  });

  return app;
}
