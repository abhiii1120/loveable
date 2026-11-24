import { AiService } from "@/shared/service/aiService";
import { parseError } from "@/shared/utils/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await AiService.listConversations(projectId);
      return data.conversations || data;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  },
);

export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await AiService.createConversation(
        projectId,
        "New conversation",
      );
      return data.conversation || data;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await AiService.listMessages(conversationId);
      return {
        conversationId,
        messages: data.messages || data,
      };
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessages",
  async ({ conversationId, content }) => {
    const { data } = await AiService.sendMMessage(conversationId, content);
    const messages = data.messages || [data.message || data];
    return {
      conversationId,
      messages: messages.filter(Boolean),
    };
  },
);
