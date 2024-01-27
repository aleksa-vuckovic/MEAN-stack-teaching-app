import mongoose from 'mongoose';

let korisnikSchema = new mongoose.Schema({
    prijava: { //datum i vreme poslednje prijave, na osnovu kog se odredjuje koja obavestenja su nova
        type: Date,
        default: new Date(0)
    },
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
    },
    radnovreme: {
        type: Object,
        default: null
    },
    nedostupnost: {
        type: Array<Object>,
        default: null
    }
})

export default mongoose.model("korisnikModel", korisnikSchema, "korisnici")