import mongoose from "mongoose";

const courseSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    provider : {
        type : String,
        required : true
    },
    companyLogo : {
        type : String,
    },
    description : {
        type : String,
        required : true
    },
    niche : {
        type : String,
        required: true
    },
    freeCertification : {
        type : String,
        enum : ["Yes", "No"],
        required : true
    },
    siteLink : {
        type :String,
        required : true
    }
})

export const Course = mongoose.model("Course", courseSchema);