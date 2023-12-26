import mongoose from 'mongoose';
import korisnikModel from './modeli/Korisnik';

export class DB {
    static korisnikPoKime(kime: string) {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({kime: kime}).then(res => {
                resolve(res) //null ako ne postoji
            }).catch((err) => {
                resolve(err)
            })
        })   
    }

    static korisnikPoMejlu(mejl: String) {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({mejl: mejl}).then(res => {
                resolve(res) //null ako ne postoji
            }).catch((err) => {
                resolve(err)
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
}