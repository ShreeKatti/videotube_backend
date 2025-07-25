import mongoose,{Schema, Types} from "mongoose"

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type:Schema.Types.ObjectId,//one who is Subscribing
            ref:"User",
        },
        channel:{
            type:Schema.Types.ObjectId,// one to whom
            ref:"User",
        },
    },{timestamps:true}
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema);