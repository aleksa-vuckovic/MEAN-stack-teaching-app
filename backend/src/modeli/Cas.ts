import mongoose from 'mongoose';

let casSchema = new mongoose.Schema({
    ucenik: String,
    nastavnik: String,
    vreme: Number,
    datum: Number,
    trajanje: Number,
    opis: String,
    predmet: String,

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
        type: Number,
        default: null
    }
})

export default mongoose.model("casModel", casSchema, "casovi")