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

    
}