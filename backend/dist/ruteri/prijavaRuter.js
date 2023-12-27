"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const PrijavaKontroler_1 = require("../kontroleri/PrijavaKontroler");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2
    }
});
let prijavaRuter = express_1.default.Router();
prijavaRuter.route("/registracija").post(upload.fields([
    { name: "profil", maxCount: 1 },
    { name: "cv", maxCount: 1 }
]), (req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().registracija(req, res);
});
prijavaRuter.route("/prijava").post((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().prijava(req, res);
});
prijavaRuter.route("/promenalozinke").post((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().promenaLozinke(req, res);
});
prijavaRuter.route("/sigurnosnopitanje").get((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().sigurnosnoPitanje(req, res);
});
prijavaRuter.route("/sigurnosniodgovor").post((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().sigurnosniOdgovor(req, res);
});
prijavaRuter.route("/zaboravljenalozinka").post((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().zaboravljenaLozinka(req, res);
});
prijavaRuter.route("/svipredmeti").get((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().sviPredmeti(req, res);
});
prijavaRuter.route("/statistika").get((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().statistika(req, res);
});
prijavaRuter.route("/svinastavnici").post((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().sviNastavnici(req, res);
});
prijavaRuter.route("/odjava").get((req, res) => {
    new PrijavaKontroler_1.PrijavaKontroler().odjava(req, res);
});
exports.default = prijavaRuter;
