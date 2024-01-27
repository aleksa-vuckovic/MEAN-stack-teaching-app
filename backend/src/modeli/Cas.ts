import mongoose from 'mongoose';

let casSchema = new mongoose.Schema({
    ucenik: String,
    nastavnik: String,
    opis: String,
    predmet: String,
    od: Date,
    do: Date,

    potvrdjen: {
        type: Date,
        default: null
    },
    odbijen: {
        type: Date,
        default: null
    },
    otkazan: {
        type: Date,
        default: null
    },

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
        type: String,
        default: null
    }
})

export default mongoose.model("casModel", casSchema, "casovi")