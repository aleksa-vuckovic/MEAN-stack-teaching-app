import express from 'express';
import multer from 'multer';
import { PrijavaKontroler } from '../kontroleri/PrijavaKontroler';
import { UcenikKontroler } from '../kontroleri/UcenikKontroler';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5*1024*1024,
        files: 2
    }
});
let ucenikRuter = express.Router()

ucenikRuter.route("/profilazuriranje").post(upload.single("profil"), (req, res) => {
    new UcenikKontroler().profilAzuriranje(req, res);
})

ucenikRuter.route("/profilpodaci").get((req, res) => {
    new UcenikKontroler().profilPodaci(req, res);
})

ucenikRuter.route("/nastavnicipretraga").post((req, res) => {
    new UcenikKontroler().nastavniciPretraga(req, res);
})

ucenikRuter.route("/nastavnikprofilpodaci").get((req, res) => {
    new UcenikKontroler().nastavnikProfilPodaci(req, res);
})

ucenikRuter.route("/nastavniktermini").post((req, res) => {
    new UcenikKontroler().nastavnikTermini(req, res);
})

ucenikRuter.route("/zakazi").post((req, res) => {
    new UcenikKontroler().zakazi(req, res);
})


export default ucenikRuter;
