import { AiService } from "@/shared/service/aiService";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLocalConversation,
  addLocalMessage,
  reset,
  setActive,
} from "../state/chatSlice";
import {
  fetchConversations,
  fetchMessages,
  createConversation as createConversationThunk,
  sendMessage as sendMessageThunk,
} from "../state/chatThunk";

const emptyMessages = [];

function entityId(entity) {
  return entity._id || entity.id;
}

function localConversation() {
  return {
    _id: `local-${crypto.randomUUID()}`,
    title: "New conversation",
    createdAt: new Date().toISOString(),
  };
}

function localMessage(author, content) {
  return {
    _id: `local-${crypto.randomUUID()}`,
    author,
    content,
    createdAt: new Date().toISOString(),
  };
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export const useChat = (projectId) => {
  const dispatch = useDispatch();

  const { conversations, activeId, error, isSending, messagesByConversation } =
    useSelector((state) => state.chat);

  const messages = messagesByConversation[activeId] || emptyMessages;

  useEffect(() => {
    dispatch(reset());
    dispatch(
      addLocalConversation({
        _id: `local-${projectId}-initial`,
        title: "New conversation",
        createdAt: new Date().toISOString(),
      }),
    );
    if (AiService.enabled) dispatch(fetchConversations(projectId));
  }, [dispatch, projectId]);

  const createConversation = useCallback(() => {
    if (AiService.enabled) {
      dispatch(createConversationThunk(projectId));
    } else {
      dispatch(addLocalConversation(localConversation()));
    }
  }, [dispatch, projectId]);

  const selectConversation = useCallback(
    (conversationId) => {
      dispatch(setActive(conversationId));
      // Only fetch if we haven't loaded this conversation yet.
      if (AiService.enabled && !messagesByConversation[conversationId]) {
        dispatch(fetchMessages(conversationId));
      }
    },
    [dispatch, messagesByConversation],
  );

  // Returns true if the messsage was sent, so the component knows to clear its draft.
  const sendMessage = useCallback(
    (rawContent) => {
      const content = rawContent.trim();
      if (!content || isSending || !activeId) return false;

      dispatch(
        addLocalMessage({
          conversationId: activeId,
          message: localMessage("user", content),
        }),
      );

      if (AiService.enabled) {
        dispatch(sendMessageThunk({ conversationId: activeId, content }));
      } else {
        dispatch(
          addLocalMessage({
            conversationId: activeId,
            message: localMessage(
              "ai",
              "The AI service is not available in this environment yet.",
            ),
          }),
        );
      }
      return true;
    },
    [dispatch, activeId, isSending],
  );

  return {
    conversations,
    activeId,
    messages,
    error,
    isSending,
    enabled: AiService.enabled,
    createConversation,
    selectConversation,
    sendMessage,
  };
};
