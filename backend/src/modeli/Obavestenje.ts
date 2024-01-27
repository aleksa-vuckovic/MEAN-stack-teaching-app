import mongoose from "mongoose";

let obavestenjeSchema = new mongoose.Schema({
    kime: String,
    datumvreme: Date,
    sadrzaj: String
})

export default mongoose.model("obavestenjeModel", obavestenjeSchema, "obavestenja")