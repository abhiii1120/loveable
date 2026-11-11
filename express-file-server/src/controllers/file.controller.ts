import type { NextFunction, Request, Response } from "express";
import { HttpError, parseFilenamesQuery } from "../utils/path.util.js";
import * as fileService from "../service/file.servicce.js";

function asFilePayload(body: unknown): Record<string, string> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(
      400,
      "Requset body must be a JSON obejct of filename -> content",
    );
  }
  return body as Record<string, string>;
}

export async function getFileTree(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tree = await fileService.getFileTree();
    res.status(200).json({
      success: true,
      message: "File tree retrieved successfully",
      tree: tree.join("\n"),
    });
  } catch (error) {
    next(error);
  }
}

export async function getFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filenamesQuery = req.query.filenames;

    if (typeof filenamesQuery !== "string") {
      throw new HttpError(400, "Invalid filenames query parameter");
    }
    const filenames = parseFilenamesQuery(filenamesQuery);
    const files = await fileService.readFiles(filenames);
    res.json({
      success: true,
      message: "File read successfully",
      files,
    });
  } catch (error) {
    next(error);
  }
}

export async function createFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const files = await fileService.writeFiles(asFilePayload(req.body));
    res.status(201).json({
      success: true,
      message: "File created successfully",
      files,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const files = await fileService.writeFiles(asFilePayload(req.body));
    res.json({
      success: true,
      message: "File updated successfully",
      files,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filenamesQuery = req.query.filenames;

    if (typeof filenamesQuery !== "string") {
      throw new HttpError(400, "Invalid filenames query parameter");
    }
    const filenames = parseFilenamesQuery(filenamesQuery);
    const files = await fileService.deleteFiles(filenames);
    res.json({
        success:true,
        message:"Files deleted successfully",
        files
    })
  } catch (error) {
    next(error);
  }
}
