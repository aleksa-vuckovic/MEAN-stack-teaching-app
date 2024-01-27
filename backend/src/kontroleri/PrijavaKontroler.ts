import express from 'express';
import Korisnik from '../modeli/Korisnik';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";
import * as bcrypt from 'bcrypt'

let podrazumevanoRadnoVreme = {
    "0": {
        od: 600*60*1000,
        do: 18*60*60*1000
    },
    "1": {
        od: 600*60*1000,
        do: 18*60*60*1000
    },
    "2": {
        od: 600*60*1000,
        do: 18*60*60*1000
    },
    "3": {
        od: 600*60*1000,
        do: 18*60*60*1000
    },
    "4": {
        od: 600*60*1000,
        do: 18*60*60*1000
    },
    "5": {
        od: 0,
        do: 0
    },
    "6": {
        od: 0,
        do: 0
    }
}

export class PrijavaKontroler {

    registracija = async (req: express.Request, res: express.Response) => {
        let ulaz = req.body;
        let izlaz: any = {};
        let ret = await Validacija.registracijaValidacija(ulaz, izlaz)
        if (ret != "ok") { res.json({poruka: ret}); return; }
        izlaz.lozinka = await Utils.enkripcija(izlaz.lozinka)

        const files = req.files as { [fieldname: string]: any };
        let profil = files["profil"] ? files["profil"][0] : null
        ret = Validacija.profilValidacija(profil)
        if (ret != "ok") { res.json({poruka: ret}); return; }
        let profilBaza = Utils.podrazumevanaProfilna();
        if (profil != null) profilBaza = Utils.sacuvajFajl(profil);
        izlaz.profil = profilBaza;

        izlaz.odobren = false;
        izlaz.aktivan = true;
        izlaz.prijava = 0;

        if (izlaz.tip == "Nastavnik") {
            let cv = files["cv"] ? files["cv"][0] : null;
            ret = Validacija.cvValidacija(cv)
            if (ret != "ok") { res.json({poruka: ret}); return; }
            let cvBaza = Utils.sacuvajFajl(cv)
            izlaz.cv = cvBaza;

            izlaz.radnovreme = podrazumevanoRadnoVreme;
            izlaz.nedostupnost = []
        }
        else {
            izlaz.odobren = true;
        }

        ret = await DB.dodajKorisnika(izlaz)
        res.json({poruka: ret})
    }
 
    prijava = async (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.lozinka || !req.body.kime) { res.json({poruka: "Nedostaju polja"})}

        let ret = await DB.korisnikPoKime(req.body.kime)
        if (ret == null) res.json({poruka: "Neispravni kredencijali."})
        else if (! await bcrypt.compare(req.body.lozinka, ret.lozinka)) res.json({poruka: "Neispravni kredencijali."})
        else {
            let session = req.session as any
            session.korisnik = ret;
            await DB.prijava(ret.kime) //pamti se vreme poslednje prijave
            res.json({
                poruka: "ok",
                podaci: {
                    kime: ret.kime,
                    tip: ret.tip
                }
            })
        }
    }

    promenaLozinke = async (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.stara || !req.body.nova || !req.body.nova2) { res.json({poruka: "Nedostaju polja"})}
        else if (Validacija.lozinkaValidacija(req.body.nova) != "ok") res.json({poruka: Validacija.lozinkaValidacija(req.body.nova)});
        else if (req.body.nova != req.body.nova2) res.json({poruka: "Nepodudaranje ponovljene lozinke."});
        else {
            let ret:any = await DB.korisnikPoKime(req.body.kime)
            if (ret == null) res.json({poruka: "Neispravni kredencijali."})
            else if (!await bcrypt.compare(req.body.stara, ret.lozinka)) res.json({poruka: "Neispravni kredencijali."})
            else {
                let ret = await DB.promeniLozinku(req.body.kime, await Utils.enkripcija(req.body.nova))
                res.json({poruka: ret})
            }
        }
    }

    sigurnosnoPitanje = async (req: express.Request, res: express.Response) => {
        let kime = req.query.kime as string
        if (!kime) res.json({poruka: "Nedostaje korisnicko ime."})
        else {
            let ret = await DB.korisnikPoKime(kime)
            if (ret == null) res.json({poruka: "Korisnik ne postoji u bazi."})
            else res.json({poruka: "ok", podaci: ret.pitanje})
        }
    }

    sigurnosniOdgovor = async (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.odgovor) res.json({poruka: "Nedostaju polja."})
        else {
            let ret = await DB.korisnikPoKime(req.body.kime)
            if (ret == null) res.json({poruka: "Korisnik ne postoji."})
            else if (ret.odgovor == req.body.odgovor) res.json({poruka: "ok"})
            else res.json({poruka: "Odgovor nije tacan."})
        }
    }

    zaboravljenaLozinka = async (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.odgovor || !req.body.nova || !req.body.nova2) res.json({poruka: "Nedostaju polja."})
        else if (Validacija.lozinkaValidacija(req.body.nova) != "ok") res.json({poruka: Validacija.lozinkaValidacija(req.body.nova)});
        else if (req.body.nova != req.body.nova2) res.json({poruka: "Nepodudaranje ponovljene lozinke."});
        else {
            let kor = await DB.korisnikPoKime(req.body.kime)
            if (kor == null) res.json({poruka: "Neispravni kredencijali."})
            else if (kor.odgovor != req.body.odgovor) res.json({poruka: "Netacan odgovor."})
            else {
                let ret = await DB.promeniLozinku(kor.kime, await Utils.enkripcija(req.body.nova))
                res.json({poruka: ret})
            }
        }
    }

    sviPredmeti = async (req: express.Request, res: express.Response) => {
        let ret = await DB.sviPredmeti()
        res.json({poruka: "ok", podaci: ret})
    }

    statistika = async (req: express.Request, res:express.Response) => {
        let brojNastavnika = await DB.brojAktivnihNastavnika()
        let brojUcenika = await DB.brojAktivnihUcenika()
        let brojCasova7 = await DB.brojOdrzanihCasova(7)
        let brojCasova30 = await DB.brojOdrzanihCasova(30)
        res.json( {
            poruka: "ok",
            podaci: {
            brojNastavnika: brojNastavnika,
            brojUcenika: brojUcenika,
            brojCasova7: brojCasova7,
            brojCasova30: brojCasova30
            }
        })
    }

    nastavniciPretraga = async (req: express.Request, res: express.Response) => {
        let pretraga = {}
        if (req.body) pretraga = req.body;
        let ret = await DB.nastavniciPretraga(pretraga, false)
        res.json({poruka: "ok", podaci: ret})
    }

    odjava = (req: express.Request, res: express.Response) => {
        if (req.session) req.session.destroy(err => {

        })
        res.json({poruka: "ok"})
    }
}