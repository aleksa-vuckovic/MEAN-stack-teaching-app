"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const UcenikKontroler_1 = require("../kontroleri/UcenikKontroler");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2
    }
});
let ucenikRuter = express_1.default.Router();
ucenikRuter.route("/profilazuriranje").post(upload.single("profil"), (req, res) => {
    new UcenikKontroler_1.UcenikKontroler().profilAzuriranje(req, res);
});
ucenikRuter.route("/profilpodaci").get((req, res) => {
    new UcenikKontroler_1.UcenikKontroler().profilPodaci(req, res);
});
ucenikRuter.route("/nastavnicipretraga").post((req, res) => {
    new UcenikKontroler_1.UcenikKontroler().nastavniciPretraga(req, res);
});
ucenikRuter.route("/nastavnikprofilpodaci").get((req, res) => {
    new UcenikKontroler_1.UcenikKontroler().nastavnikProfilPodaci(req, res);
});
ucenikRuter.route("/nastavniktermini").post((req, res) => {
    new UcenikKontroler_1.UcenikKontroler().nastavnikTermini(req, res);
});
ucenikRuter.route("/zakazi").post((req, res) => {
    new UcenikKontroler_1.UcenikKontroler().zakazi(req, res);
});
exports.default = ucenikRuter;
