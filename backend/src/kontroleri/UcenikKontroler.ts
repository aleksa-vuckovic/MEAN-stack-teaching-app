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
    
    profilAzuriranje = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ulaz = req.body;
        let izlaz: any = {};
        let ret = await Validacija.profilAzuriranjeValidacija(ulaz, izlaz, kor)
        if (ret != "ok") { res.json({poruka: ret}); return; }
        let profil = req.file;
        if (profil) {
            ret = Validacija.profilValidacija(profil);
            if (ret != "ok") { res.json({poruka: ret}); return; }
            izlaz.profil = Utils.sacuvajFajl(profil);
        }
        ret = await DB.azurirajProfil(kor.kime, izlaz)
        if (ret != "ok") {
            res.json({poruka: ret})
        }
        else {
            let ret = await DB.ucenikPodaci(kor.kime)
            res.json({poruka: "ok", podaci: ret})
        }
    }

    profilPodaci = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.ucenikPodaci(kor.kime)
        if (ret == null) res.json({poruka: "Greska u bazi."});
        else res.json({poruka: "ok", podaci: ret})
    }

    nastavniciPretraga = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let pretraga = req.body;
        if (!pretraga) pretraga = {};
        let ret = await DB.nastavniciPretraga(pretraga, true, true)
        if (ret) res.json({poruka: "ok", podaci: ret});
        else res.json({poruka: "Greska u bazi."});
    }

    nastavnikProfilPodaci = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string;
        if (!kime) { res.json({poruka: "Nedostaje argument."}); return; }
        let ret = await DB.nastavnikPodaci(kime)
        if(!ret) { res.json({poruka: "Nastavnik ne postoji."}); return }
        let ocena = await DB.nastavnikOcena(kime)
        let komentari =await DB.nastavnikKomentari(kime)
        delete ret.aktivan;
        delete ret.adresa;
        delete ret.cv; //ucenik ne bi trebalo da vidi ove podatke
        ret.komentari = komentari;
        ret.ocena = ocena;
        res.json({poruka: "ok", podaci: ret});
    }

    nastavnikTermini = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.nastavnik || !req.body.datum) { res.json({poruka: "Nedostaju argumenti."}); return }
        let ret = await  DB.korisnikPoKime(req.body.nastavnik)
        if (!ret) { res.json({poruka: "Nastavnik ne postoji."}); return }
        ret = await DB.nastavnikTerminStatusZaDan(req.body.nastavnik, new DatumVreme(req.body.datum), false)
        res.json({poruka: "ok", podaci: ret})
    }

    zakazi = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let t = req.body;
        if (!t || !t.predmet || !t.datumvreme || !t.nastavnik || !t.trajanje) { res.json({poruka: "Nedostaju argumenti."}); return;}
        let od = new DatumVreme(t.datumvreme);
        let do_ = od.dodajVreme(t.trajanje);
        if (od.proslost()) { res.json({poruka: "Ne mozete zakazivati prosle termine."}); return; }
        let ret = await DB.korisnikPoKime(t.nastavnik)
        if (!ret || ret.tip != "Nastavnik") { res.json({poruka: "Nastavnik ne postoji."}); return; }
        else if (!Validacija.odgovaraUzrast(kor, ret)) { res.json({poruka: "Izabrani nastavnik ne drzi casove ucenicima vaseg uzrasta."}); return }
        ret = await DB.nastavnikNedostupan(t.nastavnik, od, do_)
        if (ret) { res.json({poruka: "Nastavnik nije dostupan u periodu od " + ret.od.vremeString() + " do " + ret.do.vremeString()}); return }
        ret = await DB.nastavnikRadi(t.nastavnik, od, do_)
        if (ret) {
            if (ret.od.sirovoVreme() != ret.do.sirovoVreme()) res.json({poruka: "Radno vreme nastavnika je od " + ret.od.vremeString() + " do " + ret.do.vremeString()})
            else res.json({poruka: "Odabrali ste neradan dan."})
            return
        }
        ret = await DB.nastavnikImaCas(t.nastavnik, od, do_)
        if (ret) { res.json({poruka: "Nastavnik ima " + (ret.potvrdjen ? "potvrdjen" : "zakazan") + " cas u odabranom terminu."}); return }
        
        let ret2 = await DB.zakazi(t.nastavnik, kor.kime, od, do_, t.predmet, t.opis ? t.opis : "")
        if (ret2 == "ok") res.json({poruka: "ok"})
        else res.json({poruka: ret2})
    }

    casovi = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.ucenikCasovi(kor.kime)
        res.json({poruka: "ok", podaci: ret})
    }

    arhiva = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret: Array<any> = await DB.ucenikArhiva(kor.kime)
        res.json({poruka: "ok", podaci: ret})
    }

    recenzija = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let izlaz: any = {}
        let ret = await Validacija.ucenikRecenzijaValidacija(req.body, izlaz, kor.kime)
        if (ret != "ok") { res.json({poruka: ret}); return }
        ret = await DB.ucenikRecenzija(izlaz.nastavnik, izlaz.od, izlaz.ocena, izlaz.komentar)
        res.json({poruka: ret})
    }

    obavestenja = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.do) res.json({poruka: "Nedovoljno podataka."})
        let ret: Array<any> = await DB.obavestenja(kor.kime, new DatumVreme(kor.prijava), new DatumVreme(req.body.do))
        res.json({poruka: "ok", podaci: ret})
    }
}