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

export default prijavaRuter
