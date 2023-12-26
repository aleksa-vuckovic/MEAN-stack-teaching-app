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
 
    prijava = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.lozinka || !req.body.kime) { res.json({message: "Nedostaju polja"})}

        DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({message: "Neispravni kredencijali."})
            else if (ret.lozinka != req.body.lozinka) res.json({message: "Neispravni kredencijali."})
            else {
                let session = req.session as any
                session.korisnik = ret;

                res.json({
                    message: "ok",
                    data: {
                        kime: ret.kime,
                        tip: ret.tip
                    }
                })
            }
        })
    }

    promenaLozinke = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.stara || !req.body.nova || !req.body.nova2) { res.json({message: "Nedostaju polja"})}
        else if (Validacija.lozinkaValidacija(req.body.nova) != "ok") res.json({message: Validacija.lozinkaValidacija(req.body.nova)});
        else if (req.body.nova != req.body.nova2) res.json({message: "Nepodudaranje ponovljene lozinke."});
        else DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({message: "Neispravni kredencijali."})
            else if (ret.lozinka != req.body.stara) res.json({message: "Neispravni kredencijali."})
            else {
                DB.promeniLozinku(ret.kime, req.body.nova).then(ret => {
                    res.json({message: ret})
                })
            }
        })
    }

    sigurnosnoPitanje = (req: express.Request, res: express.Response) => {
        let kime = req.query.kime as string
        if (!kime) res.json({message: "Nedostaje korisnicko ime."})
        else DB.korisnikPoKime(kime).then((ret: any) => {
            if (ret == null) res.json({message: "Korisnik ne postoji u bazi."})
            else res.json({message: "ok", data: ret.pitanje})
        })
    }

    sigurnosniOdgovor = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.odgovor) res.json({message: "Nedostaju polja."})
        else DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({message: "Korisnik ne postoji."})
            else if (ret.odgovor == req.body.odgovor) res.json({message: "ok"})
            else res.json({message: "Odgovor nije tacan."})
        })
    }

    zaboravljenaLozinka = (req: express.Request, res: express.Response) => {
        if (!req.body || !req.body.kime || !req.body.odgovor || !req.body.nova || !req.body.nova2) res.json({message: "Nedostaju polja."})
        else if (Validacija.lozinkaValidacija(req.body.nova) != "ok") res.json({message: Validacija.lozinkaValidacija(req.body.nova)});
        else if (req.body.nova != req.body.nova2) res.json({message: "Nepodudaranje ponovljene lozinke."});
        else DB.korisnikPoKime(req.body.kime).then((ret: any) => {
            if (ret == null) res.json({message: "Neispravni kredencijali."})
            else if (ret.odgovor != req.body.odgovor) res.json({message: "Netacan odgovor."})
            else {
                DB.promeniLozinku(ret.kime, req.body.nova).then(ret => {
                    res.json({message: ret})
                })
            }
        })
    }
}