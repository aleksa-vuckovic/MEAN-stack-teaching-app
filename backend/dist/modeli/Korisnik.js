"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let korisnikSchema = new mongoose_1.default.Schema({
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
    predmeti: (Array),
    uzrasti: (Array),
    saznao: String,
    biografija: String,
});
exports.default = mongoose_1.default.model("korisnikModel", korisnikSchema, "korisnici");
