import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrijavaComponent } from './ruterkomponente/prijava/prijava.component';
import { RegistracijaComponent } from './ruterkomponente/registracija/registracija.component';
import { ZaboravljenaLozinkaComponent } from './ruterkomponente/zaboravljena-lozinka/zaboravljena-lozinka.component';
import { PrijavaAdministratorComponent } from './ruterkomponente/prijava-administrator/prijava-administrator.component';
import { PromenaLozinkeComponent } from './ruterkomponente/promena-lozinke/promena-lozinke.component';
import { OsajtuComponent } from './ruterkomponente/osajtu/osajtu.component';
import { UcenikProfilComponent } from './ruterkomponente/ucenik-profil/ucenik-profil.component';
import { UcenikNastavniciComponent } from './ruterkomponente/ucenik-nastavnici/ucenik-nastavnici.component';
import { UcenikNastavnikComponent } from './ruterkomponente/ucenik-nastavnik/ucenik-nastavnik.component';
import { NastavnikProfilComponent } from './ruterkomponente/nastavnik-profil/nastavnik-profil.component';
import { NastavnikKalendarComponent } from './ruterkomponente/nastavnik-kalendar/nastavnik-kalendar.component';
import { NastavnikCasoviComponent } from './ruterkomponente/nastavnik-casovi/nastavnik-casovi.component';
import { NastavnikZahteviComponent } from './ruterkomponente/nastavnik-zahtevi/nastavnik-zahtevi.component';
import { NastavnikUceniciComponent } from './ruterkomponente/nastavnik-ucenici/nastavnik-ucenici.component';
import { NastavnikDosijeComponent } from './ruterkomponente/nastavnik-dosije/nastavnik-dosije.component';
import { UcenikArhivaComponent } from './ruterkomponente/ucenik-arhiva/ucenik-arhiva.component';
import { UcenikCasoviComponent } from './ruterkomponente/ucenik-casovi/ucenik-casovi.component';
import { UcenikObavestenjaComponent } from './ruterkomponente/ucenik-obavestenja/ucenik-obavestenja.component';
import { UcenikZakazivanjeComponent } from './ruterkomponente/ucenik-zakazivanje/ucenik-zakazivanje.component';
import { AdministratorKorisniciComponent } from './ruterkomponente/administrator-korisnici/administrator-korisnici.component';
import { AdministratorNastavnikComponent } from './ruterkomponente/administrator-nastavnik/administrator-nastavnik.component';
import { AdministratorUcenikComponent } from './ruterkomponente/administrator-ucenik/administrator-ucenik.component';
import { AdministratorZahteviComponent } from './ruterkomponente/administrator-zahtevi/administrator-zahtevi.component';
import { AdministratorPredmetiComponent } from './ruterkomponente/administrator-predmeti/administrator-predmeti.component';
import { StatistikaBrojNastavnikaComponent } from './ruterkomponente/statistika-broj-nastavnika/statistika-broj-nastavnika.component';
import { StatistikaPolComponent } from './ruterkomponente/statistika-pol/statistika-pol.component';
import { StatistikaBrojCasovaComponent } from './ruterkomponente/statistika-broj-casova/statistika-broj-casova.component';
import { StatistikaAngazovanjeComponent } from './ruterkomponente/statistika-angazovanje/statistika-angazovanje.component';

const routes: Routes = [
  { path: "osajtu", component: OsajtuComponent},
  { path: "prijava", component: PrijavaComponent},
  { path: "registracija", component: RegistracijaComponent},
  { path: "prijavaAdministrator", component: PrijavaAdministratorComponent},
  { path: "zaboravljenaLozinka", component: ZaboravljenaLozinkaComponent},
  { path: "promenaLozinke", component: PromenaLozinkeComponent},
  { path: "", component: OsajtuComponent},

  { path: "ucenikProfil", component: UcenikProfilComponent},
  { path: "ucenikNastavnici", component: UcenikNastavniciComponent},
  { path: "ucenikNastavnik", component: UcenikNastavnikComponent},
  { path: "ucenikZakazivanje", component: UcenikZakazivanjeComponent},
  { path: "ucenikArhiva", component: UcenikArhivaComponent},
  { path: "ucenikCasovi", component: UcenikCasoviComponent},
  { path: "ucenikObavestenja", component: UcenikObavestenjaComponent},

  { path: "nastavnikProfil", component: NastavnikProfilComponent},
  { path: "nastavnikKalendar", component: NastavnikKalendarComponent},
  { path: "nastavnikCasovi", component: NastavnikCasoviComponent},
  { path: "nastavnikZahtevi", component: NastavnikZahteviComponent},
  { path: "nastavnikUcenici", component: NastavnikUceniciComponent},
  { path: "nastavnikDosije", component: NastavnikDosijeComponent},

  { path: "administratorKorisnici", component: AdministratorKorisniciComponent},
  { path: "administratorNastavnik", component: AdministratorNastavnikComponent},
  { path: "administratorUcenik", component: AdministratorUcenikComponent},
  { path: "administratorZahtevi", component: AdministratorZahteviComponent},
  { path: "administratorPredmeti", component: AdministratorPredmetiComponent},
  { path: "statistikaBrojNastavnika", component: StatistikaBrojNastavnikaComponent},
  { path: "statistikaPol", component: StatistikaPolComponent},
  { path: "statistikaBrojCasova", component: StatistikaBrojCasovaComponent},
  { path: "statistikaAngazovanje", component: StatistikaAngazovanjeComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
