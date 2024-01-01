import express from 'express';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";
import { DatumVreme } from '../DatumVreme';

export class NastavnikKontroler {

    private autorizacija = (req: express.Request, res: express.Response) => {
        let session = req.session as any;
        if (session && session.korisnik && session.korisnik.tip == "Nastavnik") return session.korisnik;
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
                    DB.nastavnikPodaci(kor.kime).then((ret => {
                        DB.nastavnikOcena(kor.kime).then((retOcena: number) => {
                            ret.ocena = retOcena;
                            res.json({poruka: "ok", podaci: ret})
                        })
                    }))
                }
            })
        })
    }

    profilPodaci = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        DB.nastavnikPodaci(kor.kime).then(ret => {
            if (!ret) res.json({poruka: "Greska u bazi."});
            else {
                DB.nastavnikOcena(kor.kime).then( (retOcena: number) => {
                    ret.ocena = retOcena;
                    res.json({poruka: "ok", podaci: ret})
                })   
            }
        })
    }

    termini = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.datum) res.json({poruka: "Nedostaju argumenti."})
        else DB.nastavnikTerminStatusZaDan(kor.kime, new DatumVreme(req.body.datum), true).then((ret:any) => {
            res.json({poruka: "ok", podaci: ret})
        })
    }

    radnovreme = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        DB.radnovreme(kor.kime).then((ret: any) => {
            if (!ret) res.json({poruka: "Greska u bazi."})
            else res.json({poruka: "ok", podaci: ret})
        })
    }

    radnovremeAzuriranje = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let izlaz: any = {};
        let ret = Validacija.radnovremeValidacija(req.body, izlaz);
        if (ret != "ok") res.json({poruka: ret})
        else DB.azurirajRadnovreme(kor.kime, izlaz).then((ret: string) => {
            res.json({poruka: ret})
        })
    }

    nedostupnostAzuriranje = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let izlaz: any = {}
        let ret = Validacija.nedostupnostValidacija(req.body, izlaz);
        if (ret != "ok") res.json({poruka: ret})
        else DB.azurirajNedostupnost(kor.kime, izlaz).then((ret: string) => {
            res.json({poruka: ret})
        })
    }

    casovi = (req: express.Request, res:express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let limit = 5;
        if (req.query.limit) limit = parseInt(req.query.limit as string);
        if (isNaN(limit)) limit = 5;
        DB.nastavnikCasovi(kor.kime, limit).then((ret: Array<any>) => {
            res.json({poruka: "ok", podaci: ret})
        })
    }

    otkazi = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.od || !req.body.obrazlozenje) { res.json("Nedostaju podaci."); return; }
        let od = new DatumVreme(req.body.od);
        let ret = Validacija.otkazivanjeValidacija(od);
        if (ret != "ok") res.json({poruka: ret})
        else DB.otkaziCas(kor.kime, od, req.body.obrazlozenje).then((ret: string) => {
            res.json({poruka: ret})
        })
    }

    zahtevi = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        DB.nastavnikZahtevi(kor.kime).then((ret: Array<any>) => {
            res.json({poruka: "ok", podaci: ret})
        })
    }
    potvrdi = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.od) { res.json({poruka: "Nedostaju podaci."}); return; }
        let od = new DatumVreme(req.body.od);
        DB.nastavnikOdgovor(kor.kime, od, null).then((ret: string) => {
            res.json({poruka: ret})
        })
    }
    odbij = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.od || !req.body.obrazlozenje) { res.json({poruka: "Nedostaju podaci."}); return; }
        let od = new DatumVreme(req.body.od);
        let obrazlozenje = req.body.obrazlozenje
        DB.nastavnikOdgovor(kor.kime, od, obrazlozenje).then((ret: string) => {
            res.json({poruka: ret})
        })
    }
}