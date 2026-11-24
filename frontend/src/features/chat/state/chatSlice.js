import { createSlice } from "@reduxjs/toolkit";
import {
  createConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "./chatThunk";

const entityId = (entity) => entity._id || entity.id;

let initialState = {
  conversations: [],
  activeId: null,
  messagesByConversation: {},
  error: {},
  isSending: false,
};

let chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    reset: () => initialState,
    setActive(state, action) {
      state.activeId = action.payload;
      state.error = "";
    },
    addLocalConversation(state, action) {
      state.conversations.unshift(action.payload);
      state.activeId = entityId(action.payload);
    },
    addLocalMessage(state, action) {
      const { conversationId, message } = action.payload;
      state.messagesByConversation[conversationId] ||= [];
      state.messagesByConversation[conversationId].push(message);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length) {
          state.conversations = action.payload;
          state.activeId = entityId(action.payload[0]);
        }
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeId = entityId(action.payload);
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messagesByConversation[conversationId] = messages;
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, content } = action.meta.arg || {};
        state.isSending = true;
        state.error = "";
        const conversation = state.conversations.find(
          (item) => entityId(item) === conversationId,
        );
        if (conversation?.title === "New conversation" && content) {
          conversation.title = content.slice(0, 36);
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.isSending = false;
        state.messagesByConversation[conversationId] ||= [];
        state.messagesByConversation[conversationId].push(...messages);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.error.message;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("chat/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.error = action.error.message;
        },
      );
  },
});

export const { reset, setActive, addLocalConversation, addLocalMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
