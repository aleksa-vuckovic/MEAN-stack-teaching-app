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

    skola: String,
    grade: Number,

    predmeti: Array<String>,
    uzrasti: Array<String>,
    saznao: String,
    biografija: String,
})

export default mongoose.model("korisnikModel", korisnikSchema, "korisnici")