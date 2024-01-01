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
                    DB.ucenikPodaci(kor.kime).then((ret => {
                        res.json({poruka: "ok", podaci: ret})
                    }))
                }
            })
        })
    }

    profilPodaci = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        DB.ucenikPodaci(kor.kime).then(ret => {
            if (ret == null) res.json({poruka: "Greska u bazi."});
            else res.json({poruka: "ok", podaci: ret})
        })
    }

    nastavniciPretraga = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let pretraga = req.body;
        if (!pretraga) pretraga = {};
        DB.nastavniciPretraga(pretraga, true, true).then(ret => {
            if (ret) res.json({poruka: "ok", podaci: ret});
            else res.json({poruka: "Greska u bazi."});
        })
    }

    nastavnikProfilPodaci = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string;
        if (!kime) res.json({poruka: "Nedostaje argument."})
        else DB.nastavnikPodaci(kime).then((ret: any) => {
            if(!ret) res.json({poruka: "Nastavnik ne postoji."});
            else DB.nastavnikOcena(kime).then((retOcena: number) => {
                DB.nastavnikKomentari(kime).then((retKomentari: Array<any>) => {
                    delete ret.adresa;
                    delete ret.cv; //ucenik ne bi trebalo da vidi ove podatke
                    ret.komentari = retKomentari;
                    ret.ocena = retOcena;
                    res.json({poruka: "ok", podaci: ret});
                })
            })
        })
    }

    nastavnikTermini = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.nastavnik || !req.body.datum) res.json({poruka: "Nedostaju argumenti."})
        else DB.korisnikPoKime(req.body.nastavnik).then((ret:any) => {
            if (!ret) res.json({poruka: "Nastavnik ne postoji."})
            else  DB.nastavnikTerminStatusZaDan(req.body.nastavnik, new DatumVreme(req.body.datum), false).then((ret:any) => {
                res.json({poruka: "ok", podaci: ret})
            })
        })  
    }

    zakazi = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let t = req.body;
        if (!t || !t.predmet || !t.datumvreme || !t.nastavnik || !t.trajanje) res.json({poruka: "Nedostaju argumenti."})
        else {
            let od = new DatumVreme(t.datumvreme);
            let do_ = od.dodajVreme(t.trajanje);
            if (od.proslost()) res.json({poruka: "Ne mozete zakazivati prosle termine."})
            else DB.korisnikPoKime(t.nastavnik).then((ret: any) => {
                if (!ret || ret.tip != "Nastavnik") res.json({poruka: "Nastavnik ne postoji."})
                else if (!Validacija.odgovaraUzrast(kor, ret)) res.json({poruka: "Izabrani nastavnik ne drzi casove ucenicima vaseg uzrasta."})
                else DB.nastavnikNedostupan(t.nastavnik, od, do_).then((ret: any) => {
                    if (ret) res.json({poruka: "Nastavnik nije dostupan u periodu od " + ret.od.vremeString() + " do " + ret.do.vremeString()})
                    else DB.nastavnikRadi(t.nastavnik, od, do_).then((ret: any) => {
                        if (ret) {
                            if (ret.od.sirovoVreme() != ret.do.sirovoVreme()) res.json({poruka: "Radno vreme nastavnika je od " + ret.od.vremeString() + " do " + ret.do.vremeString()})
                            else res.json({poruka: "Odabrali ste neradan dan."})
                        }
                        else DB.nastavnikImaCas(t.nastavnik, od, do_).then((ret: any) => {
                            if (ret) res.json({poruka: "Nastavnik ima " + (ret.potvrdjen ? "potvrdjen" : "zakazan") + " cas u odabranom terminu."})
                            else {
                                //zakazi cas
                                DB.zakazi(t.nastavnik, kor.kime, od, do_, t.predmet, t.opis ? t.opis : "").then((ret:string) => {
                                    if (ret == "ok") res.json({poruka: "ok"})
                                    else res.json({poruka: ret})
                                })
                            }
                        })
                    })
                })
            })
        }
    }

    casovi = (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        DB.ucenikCasovi(kor.kime).then((ret: Array<any>) => {
            res.json({poruka: "ok", podaci: ret})
        })
    }
}