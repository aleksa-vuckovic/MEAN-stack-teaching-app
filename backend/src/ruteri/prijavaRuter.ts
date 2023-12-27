import express from 'express';
import multer from 'multer';
import { PrijavaKontroler } from '../kontroleri/PrijavaKontroler';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5*1024*1024,
        files: 2
    }
});
let prijavaRuter = express.Router()

prijavaRuter.route("/registracija").post(upload.fields([
    {name: "profil", maxCount: 1},
    {name : "cv", maxCount: 1}
]), (req, res) => {
    new PrijavaKontroler().registracija(req, res);
})

prijavaRuter.route("/prijava").post((req, res) => {
    new PrijavaKontroler().prijava(req, res);
})

prijavaRuter.route("/promenalozinke").post((req, res) => {
    new PrijavaKontroler().promenaLozinke(req, res);
})

prijavaRuter.route("/sigurnosnopitanje").get((req, res) => {
    new PrijavaKontroler().sigurnosnoPitanje(req, res)
})

prijavaRuter.route("/sigurnosniodgovor").post((req, res) => {
    new PrijavaKontroler().sigurnosniOdgovor(req, res)
})

prijavaRuter.route("/zaboravljenalozinka").post((req, res) => {
    new PrijavaKontroler().zaboravljenaLozinka(req, res);
})

prijavaRuter.route("/svipredmeti").get((req, res) => {
    new PrijavaKontroler().sviPredmeti(req, res);
})

prijavaRuter.route("/statistika").get((req, res) => {
    new PrijavaKontroler().statistika(req, res);
})

prijavaRuter.route("/nastavnicipretraga").post((req, res) => {
    new PrijavaKontroler().nastavniciPretraga(req, res);
})

prijavaRuter.route("/odjava").get((req, res) => {
    new PrijavaKontroler().odjava(req, res);
})

export default prijavaRuter
