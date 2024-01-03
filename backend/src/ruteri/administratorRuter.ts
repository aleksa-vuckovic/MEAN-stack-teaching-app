import express from 'express';
import { AdministratorKontroler } from '../kontroleri/AdministratorKontroler';
import { Admin } from 'mongodb';

let administratorRuter = express.Router()

administratorRuter.route("/korisnicipretraga").post((req, res) => {
    new AdministratorKontroler().korisniciPretraga(req, res)
})

administratorRuter.route("/nastavnikpodaci").get((req, res) => {
    new AdministratorKontroler().nastavnikPodaci(req, res)
})

administratorRuter.route("/aktivacija").get((req, res) => {
    new AdministratorKontroler().aktivacija(req, res)
})

administratorRuter.route("/deaktivacija").get((req, res) => {
    new AdministratorKontroler().deaktivacija(req, res)
})

administratorRuter.route("/ucenikpodaci").get((req, res) => {
    new AdministratorKontroler().ucenikPodaci(req, res)
})

administratorRuter.route("/zahtevi").get((req, res) => { 
    new AdministratorKontroler().zahtevi(req, res)
})

administratorRuter.route("/odobreno").get((req, res) => {
    new AdministratorKontroler().odobreno(req, res)
})

administratorRuter.route("/predlozenipredmeti").get((req, res) => {
    new AdministratorKontroler().predlozeniPredmeti(req, res)
})

administratorRuter.route("/dodajpredmet").post((req, res) => {
    new AdministratorKontroler().dodajPredmet(req, res)
})

administratorRuter.route("/uklonipredmet").post((req, res) => {
    new AdministratorKontroler().ukloniPredmet(req, res)
})

administratorRuter.route("/brojnastavnikapopredmetu").get((req, res) => {
    new AdministratorKontroler().brojNastavnikaPoPredmetu(req, res)
})

administratorRuter.route("/brojnastavnikapouzrastu").get((req, res) => {
    new AdministratorKontroler().brojNastavnikaPoUzrastu(req, res)
})

administratorRuter.route("/brojkorisnikapopolu").get((req, res) => {
    new AdministratorKontroler().brojKorisnikaPoPolu(req, res)
})

administratorRuter.route("/brojcasovapodanunedelje").get((req, res) => {
    new AdministratorKontroler().brojCasovaPoDanuNedelje(req, res)
})

administratorRuter.route("/brojcasovaposatu").get((req, res) => {
    new AdministratorKontroler().brojCasovaPoSatu(req, res)
})

administratorRuter.route("/angazovanjenastavnika").get((req, res) => {
    new AdministratorKontroler().angazovanjeNastavnika(req, res)
})

administratorRuter.route("/brojcasovapopredmetupopolu").get((req, res) => {
    new AdministratorKontroler().brojCasovaPoPredmetuPoPolu(req, res)
})

export default administratorRuter;
