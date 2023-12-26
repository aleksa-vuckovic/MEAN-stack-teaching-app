"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const fs_1 = __importDefault(require("fs"));
class Utils {
    static jedinstvenoFajlIme(fajl) {
        let tip = fajl.mimetype.split('/')[1];
        return `${fajl.fieldname}-${Date.now()}.${tip}`;
    }
    static sacuvajFajl(fajl) {
        let ime = this.jedinstvenoFajlIme(fajl);
        let putanja = "D:\\7\\PIA\\Projekat\\backend\\uploads\\" + ime;
        let baza = "/uploads/" + ime;
        fs_1.default.writeFileSync(putanja, fajl.buffer);
        return baza;
    }
    static podrazumevanaProfilna() {
        return "/uploads/default-profile";
    }
}
exports.Utils = Utils;
