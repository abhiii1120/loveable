import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan";
import router from "../routes/index.routes.js";
import {createProxyMiddleware} from 'http-proxy-middleware';
import { onPreviewReaped, recordActivity } from "../service/activity.service.js";

export function createApp() {
  let app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  /** Cached proxy middleware per preview id, keyed by `uniqueId`. */
  const proxyMap : {[key:string]:Function} = {}
  const proxyMapForFiles : {[key:string]:Function} = {}
  
  // A reaped preview's service no longer exists, so its cached proxy must go to.
  onPreviewReaped((uniqueId) => {
    delete proxyMap[uniqueId]
  })

  /**
   * Returns the proxy that forwards to a preview's kubernetes service, creating
   * and caching it on first use.
   * 
   * @param uniqueId Preview id taken from the request subdomain.
   */
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

    function getProxyForFiles(uniqueId:string){

    if(proxyMapForFiles[uniqueId]){
      return proxyMapForFiles[uniqueId];
    }

    const targetUrl = `http://nextjs-service-${uniqueId}:8000`

    const proxyMiddleware = createProxyMiddleware({
      target:targetUrl,
      changeOrigin:true,
      pathRewrite:{
        '^/':'/'
      }
    })

    proxyMapForFiles[uniqueId] = proxyMiddleware

    return proxyMiddleware
  }

  /**
   * Routes preview traffic to its pod.
   * 
   * Request on a `*.preview.*` host are proxied to the matching kubernetes service.
   * Every such request also refreshes the preview's Redis activity key,
   * which is what keeps the idle reaper from tearing the pod down. Any other host
   * falls through to the regular API routes.
   */
  app.use((req:Request,res:Response,next:NextFunction) => {

    // xyz.localhost
    const host = req.headers.host || ""

    console.log("host: ",host)

    if(!host.includes("preview") && !host.includes("file-system")){
      return next()
    }

    const subdomain = host.split(".")

    const uniqueId = subdomain[0];

    if(!uniqueId){
      return res.status(400).json({
        message:"Invalid preview URL",
      })
    }
    void recordActivity(uniqueId);

    if(host.includes("file-system")){
      recordActivity(uniqueId)
      return getProxyForFiles(uniqueId)(req,res,next);
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
