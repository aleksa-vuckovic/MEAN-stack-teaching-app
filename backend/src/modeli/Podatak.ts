import mongoose from 'mongoose';

let podatakSchema = new mongoose.Schema({
    podatak: String,
    vrednosti: Array<String>
})

export default mongoose.model("podatakModel", podatakSchema, "podaci")