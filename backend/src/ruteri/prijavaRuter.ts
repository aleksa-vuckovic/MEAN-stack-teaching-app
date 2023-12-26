import express from 'express';
import multer from 'multer';
import { PrijavaController } from '../kontroleri/PrijavaKontroler';

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
    new PrijavaController().registracija(req, res);
})

prijavaRuter.route("/prijava").post((req, res) => {
    new PrijavaController().prijava(req, res);
})

prijavaRuter.route("/promenalozinke").post((req, res) => {
    new PrijavaController().promenaLozinke(req, res);
})

prijavaRuter.route("/sigurnosnopitanje").get((req, res) => {
    new PrijavaController().sigurnosnoPitanje(req, res)
})

prijavaRuter.route("/sigurnosniodgovor").post((req, res) => {
    new PrijavaController().sigurnosniOdgovor(req, res)
})

prijavaRuter.route("/zaboravljenalozinka").post((req, res) => {
    new PrijavaController().zaboravljenaLozinka(req, res);
})

prijavaRuter.route("/svipredmeti").get((req, res) => {
    new PrijavaController().sviPredmeti(req, res);
})

export default prijavaRuter
