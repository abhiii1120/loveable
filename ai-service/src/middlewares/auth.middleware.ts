import  jwt  from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from './error.middleware.js';
import { env } from '../config/env.js';
export type AuthenticatedUser = {
    id:string,
    email:string,
    name:string,
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser
        }
    }
}

export function authenticate(req:Request,_res:Response,next:NextFunction){
    const [scheme,token] = req.headers.authorization?.split(" ") ?? []

    if(scheme !== 'Bearer' || !token){
        next(new AppError(401,"Exprected Authorization: Bearer <token>"))
        return 
    }

    try {
        const payload = jwt.verify(token,env.ACCESS_TOKEN_SECRET) as{
            sub?:string,
            email?:string,
            name?:string
        }

        if(!payload.email || !payload.name || !payload.sub) { 
            throw new Error("Missing required token claims")
        }

        req.user = {
            id:payload.sub,
            email:payload.email,
            name:payload.name
        }
        next()
    } catch (error) {
        next(new AppError(401,"Invalid or expired access token"))
    }
}