import express from 'express';
import Korisnik from '../modeli/Korisnik';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";

let podrazumevanoRadnoVreme = {
    "0": {
        od: 600,
        do: 18*60
    },
    "1": {
        od: 600,
        do: 18*60
    },
    "2": {
        od: 600,
        do: 18*60
    },
    "3": {
        od: 600,
        do: 18*60
    },
    "4": {
        od: 600,
        do: 18*60
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

    registracija = (req: express.Request, res: express.Response) => {
        let ulaz = req.body;
        let izlaz: any = {};
        Validacija.registracijaValidacija(ulaz, izlaz).then(ret => {
            if (ret != "ok") { res.json({poruka: ret}); return; }

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

            DB.dodajKorisnika(izlaz).then(ret => {
                res.json({poruka: ret})
            });
        })
    }
 
    prijava = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.lozinka || !req.body.kime) { res.json({poruka: "Nedostaju polja"})}

        DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({poruka: "Neispravni kredencijali."})
            else if (ret.lozinka != req.body.lozinka) res.json({poruka: "Neispravni kredencijali."})
            else {
                let session = req.session as any
                session.korisnik = ret;
                DB.prijava(ret.kime) //pamti se vreme poslednje prijave
                res.json({
                    poruka: "ok",
                    podaci: {
                        kime: ret.kime,
                        tip: ret.tip,
                        skola: ret.skola,
                        razred: ret.razred
                    }
                })
            }
        })
    }

    promenaLozinke = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.stara || !req.body.nova || !req.body.nova2) { res.json({poruka: "Nedostaju polja"})}
        else if (Validacija.lozinkaValidacija(req.body.nova) != "ok") res.json({poruka: Validacija.lozinkaValidacija(req.body.nova)});
        else if (req.body.nova != req.body.nova2) res.json({poruka: "Nepodudaranje ponovljene lozinke."});
        else DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({poruka: "Neispravni kredencijali."})
            else if (ret.lozinka != req.body.stara) res.json({poruka: "Neispravni kredencijali."})
            else {
                DB.promeniLozinku(req.body.kime, req.body.nova).then(ret => {
                    res.json({poruka: ret})
                })
            }
        })
    }

    sigurnosnoPitanje = (req: express.Request, res: express.Response) => {
        let kime = req.query.kime as string
        if (!kime) res.json({poruka: "Nedostaje korisnicko ime."})
        else DB.korisnikPoKime(kime).then((ret: any) => {
            if (ret == null) res.json({poruka: "Korisnik ne postoji u bazi."})
            else res.json({poruka: "ok", podaci: ret.pitanje})
        })
    }

    sigurnosniOdgovor = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.odgovor) res.json({poruka: "Nedostaju polja."})
        else DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({poruka: "Korisnik ne postoji."})
            else if (ret.odgovor == req.body.odgovor) res.json({poruka: "ok"})
            else res.json({poruka: "Odgovor nije tacan."})
        })
    }

    zaboravljenaLozinka = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.odgovor || !req.body.nova || !req.body.nova2) res.json({poruka: "Nedostaju polja."})
        else if (Validacija.lozinkaValidacija(req.body.nova) != "ok") res.json({poruka: Validacija.lozinkaValidacija(req.body.nova)});
        else if (req.body.nova != req.body.nova2) res.json({poruka: "Nepodudaranje ponovljene lozinke."});
        else DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({poruka: "Neispravni kredencijali."})
            else if (ret.odgovor != req.body.odgovor) res.json({poruka: "Netacan odgovor."})
            else {
                DB.promeniLozinku(ret.kime, req.body.nova).then(ret => {
                    res.json({poruka: ret})
                })
            }
        })
    }

    sviPredmeti = (req: express.Request, res: express.Response) => {
        DB.sviPredmeti().then(ret => {
            res.json({poruka: "ok", podaci: ret})
        })
    }

    statistika = (req: express.Request, res:express.Response) => {
        DB.brojAktivnihNastavnika().then((retBrojNastavnika: number) => {
            DB.brojAktivnihUcenika().then((retBrojUcenika: number) => {
                res.json( {
                    poruka: "ok",
                    podaci: {
                    brojNastavnika: retBrojNastavnika,
                    brojUcenika: retBrojUcenika
                    }
                })
            })
        })
    }

    nastavniciPretraga = (req: express.Request, res: express.Response) => {
        let pretraga = {}
        if (req.body) pretraga = req.body;
        DB.nastavniciPretraga(pretraga, false).then(ret => {
            res.json({poruka: "ok", podaci: ret})
        })
    }

    odjava = (req: express.Request, res: express.Response) => {
        if (req.session) req.session.destroy(err => {

        })
        res.json({poruka: "ok"})
    }
}