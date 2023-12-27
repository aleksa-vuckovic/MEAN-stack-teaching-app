"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
}
exports.Utils = Utils;
