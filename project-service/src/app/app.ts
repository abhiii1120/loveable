import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan";
import router from "../routes/index.routes.js";
import {createProxyMiddleware} from 'http-proxy-middleware';

export function createApp() {
  let app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  const proxyMap : {[key:string]:Function} = {}

  function getProxy(uniqueId:string){

    if(proxyMap[uniqueId]){
      return proxyMap[uniqueId];
    }

    const targetUrl = `http://nextjs-service-${uniqueId}`

    const proxyMiddleware = createProxyMiddleware({
      target:targetUrl,
      changeOrigin:true,
      pathRewrite:{
        '^/':'/'
      }
    })

    proxyMap[uniqueId] = proxyMiddleware

    return proxyMiddleware
  }

  app.use((req:Request,res:Response,next:NextFunction) => {

    // xyz.localhost
    const host = req.headers.host || ""

    console.log("host: ",host)

    if(!host.includes("preview")){
      return next()
    }

    const subdomain = host.split(".")

    if(!subdomain[1]){
      return next()
    }

    const uniqueId = subdomain[0];

    if(!uniqueId){
      return res.status(400).json({
        message:"Invalid preview URL",
      })
    }

    return getProxy(uniqueId)(req,res,next);
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
