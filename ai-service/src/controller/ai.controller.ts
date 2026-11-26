import { MessageModel } from "../models/message.model.js";
import { ConversationModel } from "../models/conversation.model.js";
import { projectModel } from "../models/project.model.js";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/error.middleware.js";
import { getConversationTitle } from "../service/ai/ai.service.js";

export async function handleMessageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;
    let conversation = null;

    if (!user) {
      throw new AppError(401, "Unauthorized");
    }

    const project = await projectModel.findOne({
      _id: req.body.projectId,
      user: user.id,
    });

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    if (req.body.conversationId) {
      conversation = await ConversationModel.findOne({
        _id: req.body.conversationId,
      });
      if (!conversation) {
        throw new AppError(404, "Conversation not found");
      }
      if (conversation.project?.toString() !== project.id) {
        throw new AppError(403, "Conversation does not belong to the project");
      }
      if (conversation.user?.toString() !== user.id) {
        throw new AppError(403, "Conversation does not belong to the user");
      }
    } else {
      const title = await getConversationTitle(req.body.content);

      conversation = await ConversationModel.create({
        title,
        project: project.id,
        user: user.id,
      });
    }

    // ---- Set Headers ----
    res.setHeader("X-Conversation-Id", conversation.id);
    res.setHeader("X-Conversation-Title", conversation.title);
    res.setHeader(
      "Access-Control-Expose-Headers",
      "X-Conversation-Id, X-Conversation-Title",
    );

    // ---- SSE Headers ----
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
  } catch (error) {
    next(error);
  }
}
