import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title : {
      type : String,
      required : true
  },
  companyName : {
      type : String,
      required : true
  },
  companyLogo : {
      type : String,
      required : true
  },
  shortDescription : {
      type : String,
      required : true
  },
  lengthyDescription : {
      type : String,
      required: true
  },
  skills : {
      type : [String],
      required : true
  },
  location : {
      type : [String],
      required : true
  },
  jobType : {
      type : String,
      required : true
  },
  salary : {
      type : String,
      required: true
  },
  niche : {
      type : String,
      required : true
  },
  applyLink : {
      type : String,
      required : true
  },
  companyDescription : {
      type : String,
      required : true
  },
})

export const Job = mongoose.model("Job", jobSchema);