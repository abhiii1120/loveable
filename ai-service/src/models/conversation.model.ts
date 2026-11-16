import mongoose, { type InferSchemaType } from "mongoose";

const conversationSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    users:{
        type:mongoose.Schema.Types.ObjectId
    },
    project:{
        type:mongoose.Schema.Types.ObjectId
    }
},{
    timestamps:true,
})

export type Conversation = InferSchemaType<typeof conversationSchema>;

export const ConversationModel = mongoose.model<Conversation>('Conversation',conversationSchema);