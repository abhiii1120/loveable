import path from "node:path";
import { IGNORED_DIRS,IGNORED_FILES,S3_PREFIX,WORK_FOLDER } from "../config/env.js";

export function toRelativePath(absolutePath:string):string{
    return path.relative(WORK_FOLDER,absolutePath).split(path.sep).join("/");
}

export function toAbsolutePath(relativePath:string):string{
    const absolute = path.resolve(WORK_FOLDER,`.${path.posix.sep}${relativePath.replace(/^\/+/,"")}`);
    const relative = path.relative(WORK_FOLDER,absolute);

    if(relative.startsWith("..") || path.isAbsolute(relative)){
        throw new Error(`Path escapes work folder: ${relativePath}`);
    }

    return absolute
}

export function toObjectKey(relativePath:string):string{
    return `${S3_PREFIX}${relativePath}`
}

export function toRelativeFromKey(key:string):string {
    return key.slice(S3_PREFIX.length);
}

export function isIgnored(relativePath:string):boolean {
    if(!relativePath) return false;

    const segments = relativePath.split("/");
    const filename = segments[segments.length -1] ?? "";

    return (
        segments.slice(0,-1).some((segment) => IGNORED_DIRS.has(segment))
    )
}