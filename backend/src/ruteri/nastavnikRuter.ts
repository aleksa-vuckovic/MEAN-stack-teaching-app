import express from 'express';
import multer from 'multer';
import { NastavnikKontroler } from '../kontroleri/NastavnikKontroler';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5*1024*1024,
        files: 2
    }
});
let nastavnikRuter = express.Router()

nastavnikRuter.route("/profilazuriranje").post(upload.single("profil"), (req, res) => {
    new NastavnikKontroler().profilAzuriranje(req, res);
})

nastavnikRuter.route("/profilpodaci").get((req, res) => {
    new NastavnikKontroler().profilPodaci(req, res);
})

nastavnikRuter.route("/termini").post((req, res) => {
    new NastavnikKontroler().termini(req, res);
})

nastavnikRuter.route("/radnovreme").get((req, res) => {
    new NastavnikKontroler().radnovreme(req, res);
})

nastavnikRuter.route("/radnovremeazuriranje").post((req, res) => {
    new NastavnikKontroler().radnovremeAzuriranje(req, res)
})

nastavnikRuter.route("/nedostupnostazuriranje").post((req, res) => {
    new NastavnikKontroler().nedostupnostAzuriranje(req, res);
})

nastavnikRuter.route("/casovi").get((req, res) => {
    new NastavnikKontroler().casovi(req, res);
})

nastavnikRuter.route("/otkazi").post((req, res) => {
    new NastavnikKontroler().otkazi(req, res)
})

nastavnikRuter.route("/zahtevi").get((req, res) => {
    new NastavnikKontroler().zahtevi(req, res)
})

nastavnikRuter.route("/potvrdi").post((req, res) => {
    new NastavnikKontroler().potvrdi(req, res)
})

nastavnikRuter.route("/odbij").post((req, res) => {
    new NastavnikKontroler().odbij(req, res)
})

nastavnikRuter.route("/ucenici").get((req, res) => {
    new NastavnikKontroler().ucenici(req, res)
})

nastavnikRuter.route("/dosije").post((req, res) => {
    new NastavnikKontroler().dosije(req, res)
})

nastavnikRuter.route("/recenzija").post((req, res) => {
    new NastavnikKontroler().recenzija(req, res)
})

export default nastavnikRuter;
