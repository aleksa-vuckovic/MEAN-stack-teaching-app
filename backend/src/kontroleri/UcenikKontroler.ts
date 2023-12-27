import express from 'express';
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
    
    profilAzuriranje = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ulaz = req.body;
        let izlaz: any = {};
        Validacija.profilAzuriranjeValidacija(ulaz, izlaz, kor).then(ret => {
            if (ret != "ok") res.json({poruka: ret});
            let profil = req.file;
            if (profil) {
                ret = Validacija.profilValidacija(profil);
                if (ret != "ok") { res.json({poruka: ret}); return; }
                izlaz.profil = Utils.sacuvajFajl(profil);
            }
            DB.azurirajProfil(kor.kime, izlaz).then(ret => {
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

    profilPodaci = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        DB.ucenikProfilPodaci(kor.kime).then(ret => {
            if (ret == null) res.json({poruka: "Greska u bazi."});
            else res.json({poruka: "ok", podaci: ret})
        })
    }
}