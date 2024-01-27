"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let korisnikSchema = new mongoose_1.default.Schema({
    prijava: {
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
        type: (Array),
        default: null
    },
    uzrasti: {
        type: (Array),
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
        type: (Array),
        default: null
    }
});
exports.default = mongoose_1.default.model("korisnikModel", korisnikSchema, "korisnici");
