"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdministratorKontroler_1 = require("../kontroleri/AdministratorKontroler");
let administratorRuter = express_1.default.Router();
administratorRuter.route("/korisnicipretraga").post((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().korisniciPretraga(req, res);
});
administratorRuter.route("/nastavnikpodaci").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().nastavnikPodaci(req, res);
});
administratorRuter.route("/aktivacija").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().aktivacija(req, res);
});
administratorRuter.route("/deaktivacija").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().deaktivacija(req, res);
});
administratorRuter.route("/ucenikpodaci").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().ucenikPodaci(req, res);
});
administratorRuter.route("/zahtevi").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().zahtevi(req, res);
});
administratorRuter.route("/odobreno").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().odobreno(req, res);
});
administratorRuter.route("/predlozenipredmeti").get((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().predlozeniPredmeti(req, res);
});
administratorRuter.route("/dodajpredmet").post((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().dodajPredmet(req, res);
});
administratorRuter.route("/uklonipredmet").post((req, res) => {
    new AdministratorKontroler_1.AdministratorKontroler().ukloniPredmet(req, res);
});
exports.default = administratorRuter;
