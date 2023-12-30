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


export default nastavnikRuter;