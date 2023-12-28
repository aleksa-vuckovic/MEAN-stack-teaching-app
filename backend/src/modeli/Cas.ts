import mongoose from 'mongoose';

let casSchema = new mongoose.Schema({
    ucenik: String,
    nastavnik: String,
    vreme: Number,
    datum: Number,
    trajanje: Number,
    potvrdjen: Boolean,

    ocenaUcenik: {
        type: Number,
        default: null
    },
    komentarUcenik: {
        type: String,
        default: null
    },
    ocenaNastavnik: {
        type: Number,
        default: null
    },
    komentarNastavnik: {
        type: Number,
        default: null
    }
})

export default mongoose.model("casModel", casSchema, "casovi")