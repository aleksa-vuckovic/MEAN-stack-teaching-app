import express from 'express';
import Korisnik from '../modeli/Korisnik';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";

export class UcenikKontroler {

    private autorizacija = (req: express.Request, res: express.Response) => {
        let session = req.session as any;
        if (session && session.korisnik && session.korisnik.tip == "Ucenik") return session.korisnik;
        else {
            res.json({poruka: "Nautorizovan pristup."});
            return null;
        }
    }
    
    azuriranjeProfila = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ulaz = req.body;
        let izlaz: any = {};
        Validacija.profilAzuriranjeValidacija(ulaz, izlaz, kor).then(ret => {
            if (ret != "ok") res.json({poruka: ret});
            else DB.azurirajProfil(kor.kime, izlaz).then(ret => {
                if (ret != "ok") {
                    res.json({poruka: ret})
                }
                else {
                    DB.ucenikProfilPodaci(kor.kime).then((ret => {
                        res.json({poruka: "ok", podaci: ret})
                    }))
                }
            })
        })
    }
}