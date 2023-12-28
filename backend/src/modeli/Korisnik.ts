import mongoose from 'mongoose';

let korisnikSchema = new mongoose.Schema({
    kime: String,
    lozinka: String,
    pitanje: String,
    odgovor: String,
    ime: String,
    prezime: String,
    tip: String,
    pol: String,
    adresa: String,
    telefon: String,
    mejl: String,
    profil: String,
    odobren: Boolean,
    aktivan: Boolean,

    skola: {
        type: String,
        default: null
    },
    razred: {
        type: Number,
        default: null
    },

    predmeti: {
        type: Array<String>,
        default: null
    },
    uzrasti: {
        type: Array<String>,
        default: null
    },
    saznao: {
        type: String,
        default: null
    },
    cv: {
        type: String,
        default: null
    }
})

export default mongoose.model("korisnikModel", korisnikSchema, "korisnici")