import mongoose from 'mongoose';

let casSchema = new mongoose.Schema({
    ucenik: String,
    nastavnik: String,
    opis: String,
    predmet: String,
    od: Number,
    do: Number,

    potvrdjen: {
        type: Number,
        default: null
    },
    odbijen: {
        type: Number,
        default: null
    },
    otkazan: {
        type: Number,
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