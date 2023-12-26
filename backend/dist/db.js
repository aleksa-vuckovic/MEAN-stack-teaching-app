"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Korisnik_1 = __importDefault(require("./modeli/Korisnik"));
class DB {
    static korisnikPoKime(kime) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.findOne({ kime: kime }).then(res => {
                resolve(res); //null ako ne postoji
            }).catch((err) => {
                resolve(null);
            });
        });
    }
    static korisnikPoMejlu(mejl) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.findOne({ mejl: mejl }).then(res => {
                resolve(res); //null ako ne postoji
            }).catch((err) => {
                resolve(null);
            });
        });
    }
    static dodajKorisnika(kor) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.insertMany([kor]).then(res => {
                resolve("ok");
            }).catch(err => {
                resolve("Greska u bazi.");
            });
        });
    }
    static promeniLozinku(kime, nova) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.updateOne({ kime: kime }, { $set: { lozinka: nova } }).then(res => {
                if (res.modifiedCount > 0)
                    resolve("ok");
                else
                    resolve("Nije pronadjen korisnik.");
            }).catch(err => {
                resolve("Greska u bazi.");
            });
        });
    }
}
exports.DB = DB;
