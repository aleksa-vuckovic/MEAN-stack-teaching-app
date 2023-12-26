import mongoose from 'mongoose';
import korisnikModel from './modeli/Korisnik';
import podatakModel from './modeli/Podatak';

export class DB {
    static korisnikPoKime(kime: string) {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({kime: kime}).then(res => {
                resolve(res) //null ako ne postoji
            }).catch((err) => {
                resolve(null)
            })
        })   
    }

    static korisnikPoMejlu(mejl: String) {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({mejl: mejl}).then(res => {
                resolve(res) //null ako ne postoji
            }).catch((err) => {
                resolve(null)
            })
        })  
    }

    static dodajKorisnika(kor: any) {
        return new Promise((resolve, reject) => {
            korisnikModel.insertMany([kor]).then(res => {
                resolve("ok")
            }).catch(err => {
                resolve("Greska u bazi.")
            })
        })
    }

    static promeniLozinku(kime: string, nova: string) {
        return new Promise((resolve, reject) => {
            korisnikModel.updateOne({kime: kime}, {$set: {lozinka: nova}}).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Nije pronadjen korisnik.")
            }).catch(err => {
                resolve("Greska u bazi.")
            })
        })
    }

    static sviPredmeti() {
        return new Promise((resolve, reject) => {
            podatakModel.findOne({podatak: "predmeti"}).then((res:any) => {
                resolve(res.vrednosti);
            }).catch(err => {
                resolve([])
            })
        })
    }

    /* Vraca {
        brojNastavnika: 
        brojUcenika: 
    }
    */
    static statistika() {
        
    }
}