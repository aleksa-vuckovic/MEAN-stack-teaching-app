import express from 'express';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";
import { DatumVreme } from '../DatumVreme';

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
            if (ret != "ok") { res.json({poruka: ret}); return; }
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

    nastavniciPretraga = (req: express.Request, res: express.Response) => {
        //let kor = this.autorizacija(req, res);
        //if (!kor) return;
        let pretraga = req.body;
        if (!pretraga) pretraga = {};
        DB.nastavniciPretraga(pretraga, true, true).then(ret => {
            if (ret) res.json({poruka: "ok", podaci: ret});
            else res.json({poruka: "Greska u bazi."});
        })
    }

    nastavnikProfilPodaci = (req: express.Request, res: express.Response) => {
        //let kor = this.autorizacija(req, res);
        //if (!kor) return;
        if (!req.query.kime) res.json({poruka: "Nedostaje argument."})
        else DB.nastavnikProfilPodaci(req.query.kime as string).then((ret: any) => {
            if (ret) res.json({poruka: "ok", podaci: ret});
            else res.json({poruka: "Greska u bazi."});
        })
    }

    nastavnikTermini = (req: express.Request, res: express.Response) => {
        //let kor = this.autorizacija(req, res);
        //if (!kor) return;
        if (!req.body || !req.body.nastavnik || !req.body.datum) res.json({poruka: "Nedostaju argumenti."})
        else DB.korisnikPoKime(req.body.nastavnik).then((ret:any) => {
            if (!ret) res.json({poruka: "Nastavnik ne postoji."})
            else  DB.nastavnikTerminStatusZaDan(req.body.nastavnik, new DatumVreme(req.body.datum), false).then((ret:any) => {
                res.json({poruka: "ok", podaci: ret})
            })
        })  
    }
}