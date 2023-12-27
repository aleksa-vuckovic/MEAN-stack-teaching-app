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

export default ucenikRuter;