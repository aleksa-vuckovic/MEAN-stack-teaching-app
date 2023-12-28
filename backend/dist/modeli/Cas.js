"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let casSchema = new mongoose_1.default.Schema({
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
});
exports.default = mongoose_1.default.model("casModel", casSchema, "casovi");
