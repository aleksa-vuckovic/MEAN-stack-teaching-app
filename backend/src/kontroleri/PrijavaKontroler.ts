import express from 'express';
import Korisnik from '../modeli/Korisnik';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";

export class PrijavaController {

    registracija = (req: express.Request, res: express.Response) => {
        let body = req.body;
        if (!body) { res.json({message: "Nedostaju polja."}); return; }
        Validacija.registracijaValidacija(body).then(ret => {
            if (ret != "ok") { res.json({message: ret}); return; }
            const files = req.files as { [fieldname: string]: any };
            let profil = files["profil"] ? files["profil"][0] : null
            ret = Validacija.profilValidacija(profil)
            if (ret != "ok") { res.json({message: ret}); return; }
            let profilBaza = Utils.podrazumevanaProfilna();
            if (profil != null) profilBaza = Utils.sacuvajFajl(profil);
            body["profil"] = profilBaza;

            if (req.body.tip == "Ucenik") {
                ret = Validacija.ucenikValidacija(body);
                if (ret != "ok") { res.json({message: ret}); return; }
                body["odobren"] = true;
                body["aktivan"] = true;

                DB.dodajKorisnika(body).then(ret => {
                    res.json({message: ret})
                });
            } else {
                ret = Validacija.nastavnikValidacija(body);
                if (ret != "ok") { res.json({message: ret}); return; }

                let cv = files["cv"] ? files["cv"][0] : null;
                ret = Validacija.cvValidacija(cv)
                if (ret != "ok") { res.json({message: ret}); return; }
                let cvBaza = Utils.sacuvajFajl(cv)
                
                body["cv"] = cvBaza;
                body["odobren"] = false;
                body["aktivan"] = true;
                //insert into database
                DB.dodajKorisnika(body).then(ret => {
                    res.json({message: ret})
                });
            }
        })
    }
}