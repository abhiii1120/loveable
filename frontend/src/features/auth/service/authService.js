import { httpClient } from "@/shared/service/httpClient";

export const authService = {
    register(payload){
        return httpClient.post("/auth/register",payload)
    },
    login(payload){
        return httpClient.post("/auth/login",payload)
    }
}