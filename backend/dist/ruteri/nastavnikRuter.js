"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const NastavnikKontroler_1 = require("../kontroleri/NastavnikKontroler");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2
    }
});
let nastavnikRuter = express_1.default.Router();
nastavnikRuter.route("/profilazuriranje").post(upload.single("profil"), (req, res) => {
    new NastavnikKontroler_1.NastavnikKontroler().profilAzuriranje(req, res);
});
nastavnikRuter.route("/profilpodaci").get((req, res) => {
    new NastavnikKontroler_1.NastavnikKontroler().profilPodaci(req, res);
});
nastavnikRuter.route("/termini").post((req, res) => {
    new NastavnikKontroler_1.NastavnikKontroler().termini(req, res);
});
nastavnikRuter.route("/radnovreme").get((req, res) => {
    new NastavnikKontroler_1.NastavnikKontroler().radnovreme(req, res);
});
nastavnikRuter.route("/radnovremeazuriranje").post((req, res) => {
    new NastavnikKontroler_1.NastavnikKontroler().radnovremeAzuriranje(req, res);
});
exports.default = nastavnikRuter;
