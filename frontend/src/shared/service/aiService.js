import { httpClient } from "./httpClient";

const AI_BASE = '/api/ai';

export const AiService = {
    enabled: import.meta.env.VITE_ENABLE_AI_API === 'true',

    listConversations(projectId){
        return httpClient.get(`${AI_BASE}/projects/${projectId}/conversations`)
    },

    createConversation(projectId,title){
        return httpClient.post(`${AI_BASE}/pojects/${projectId}/conversations`,title)
    },

    listMessages(conversationId){
        return httpClient.get(`${AI_BASE}/conversations/${conversationId}/messages`)
    },

    
}