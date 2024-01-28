"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt = __importStar(require("bcrypt"));
class Utils {
    static jedinstvenoFajlIme(fajl) {
        let tip = fajl.mimetype.split('/')[1];
        return `${fajl.fieldname}-${Date.now()}.${tip}`;
    }
    static sacuvajFajl(fajl) {
        let ime = this.jedinstvenoFajlIme(fajl);
        let putanja = path_1.default.join(__dirname, "..", "uploads", ime);
        let baza = "/uploads/" + ime;
        fs_1.default.writeFileSync(putanja, fajl.buffer);
        return baza;
    }
    static podrazumevanaProfilna() {
        return "/uploads/default-profile.jpeg";
    }
    static slikaUrl(slika) {
        return "http://localhost:4000" + slika;
    }
    static slikaPrefiks() {
        return "http://localhost:4000";
    }
    static uzrast(korisnik) {
        if (korisnik.skola != "Osnovna")
            return "Srednja";
        else if (korisnik.razred > 4)
            return "Osnovna 5-8";
        else
            return "Osnovna 1-4";
    }
    static enkripcija(lozinka) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt.genSalt(10);
            const hash = yield bcrypt.hash(lozinka, salt);
            return hash;
        });
    }
    static naSirini(broj, sirina) {
        let res = broj.toString();
        for (let i = res.length; i < sirina; i++)
            res = "0" + res;
        return res;
    }
}
exports.Utils = Utils;
