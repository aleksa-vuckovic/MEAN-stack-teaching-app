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
    new PrijavaKontroler_1.PrijavaController().registracija(req, res);
});
exports.default = prijavaRuter;
