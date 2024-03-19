import mongoose, { Schema } from "mongoose";
const subScriptionSchema = new Schema({
    subScriber: {
        type: Schema.Types.ObjectId,//one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,//one who subscriber is subscribing
        ref: "User"

    }
},
{ timestamps: true })

export const Subscription = mongoose.model("Subscription", subScriptionSchema)