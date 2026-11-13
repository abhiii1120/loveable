import  path  from 'node:path';

function required(name:string):string{
    const value = process.env[name];
    if(!value) throw new Error(`Missing required env variable: ${name}`);
    return value
}

export const PROJECT_ID = required("PROJECT_ID");

export const WORK_FOLDER = path.resolve(process.env.WORK_FOLDER ?? "/app");

export const S3_BUCKET = process.env.S3_BUCKET ?? "pineapple";
export const S3_REGION = process.env.S3_REGION ?? "ap-southeast-2";
export const S3_PREFIX = `projects/${PROJECT_ID}`;

export const AWS_ACCESS_KEY_ID = required("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = required("AWS_SECRET_ACCESS_KEY");

export const FLUSH_DEBOUNCE_MS = Number(process.env.FLUSH_DEBOUNCE_MS ?? 1000);