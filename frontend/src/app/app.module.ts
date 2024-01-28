import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrijavaComponent } from './ruterkomponente/prijava/prijava.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistracijaComponent } from './ruterkomponente/registracija/registracija.component';
import { FajlInputComponent } from './subkomponente/fajl-input/fajl-input.component';
import { PrijavaNavigacijaComponent } from './subkomponente/prijava-navigacija/prijava-navigacija.component';
import { PrijavaAdministratorComponent } from './ruterkomponente/prijava-administrator/prijava-administrator.component';
import { ZaboravljenaLozinkaComponent } from './ruterkomponente/zaboravljena-lozinka/zaboravljena-lozinka.component';
import { PromenaLozinkeComponent } from './ruterkomponente/promena-lozinke/promena-lozinke.component';
import { OsajtuComponent } from './ruterkomponente/osajtu/osajtu.component';
import { UcenikNavigacijaComponent } from './subkomponente/ucenik-navigacija/ucenik-navigacija.component';
import { UcenikProfilComponent } from './ruterkomponente/ucenik-profil/ucenik-profil.component';
import { ZvezdeComponent } from './subkomponente/zvezde/zvezde.component';
import { UcenikNastavniciComponent } from './ruterkomponente/ucenik-nastavnici/ucenik-nastavnici.component';
import { UcenikNastavnikComponent } from './ruterkomponente/ucenik-nastavnik/ucenik-nastavnik.component';
import { KomentarComponent } from './subkomponente/komentar/komentar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VremeInputComponent } from './subkomponente/vreme-input/vreme-input.component';
import { DatumVremeInputComponent } from './subkomponente/datum-vreme-input/datum-vreme-input.component';
import { KalendarComponent } from './subkomponente/kalendar/kalendar.component';
import { NastavnikProfilComponent } from './ruterkomponente/nastavnik-profil/nastavnik-profil.component';
import { NastavnikNavigacijaComponent } from './subkomponente/nastavnik-navigacija/nastavnik-navigacija.component';
import { NastavnikKalendarComponent } from './ruterkomponente/nastavnik-kalendar/nastavnik-kalendar.component';
import { RadnovremeInputComponent } from './subkomponente/radnovreme-input/radnovreme-input.component';
import { NastavnikCasoviComponent } from './ruterkomponente/nastavnik-casovi/nastavnik-casovi.component';
import { NastavnikZahteviComponent } from './ruterkomponente/nastavnik-zahtevi/nastavnik-zahtevi.component';
import { NastavnikUceniciComponent } from './ruterkomponente/nastavnik-ucenici/nastavnik-ucenici.component';
import { NastavnikDosijeComponent } from './ruterkomponente/nastavnik-dosije/nastavnik-dosije.component';
import { UcenikArhivaComponent } from './ruterkomponente/ucenik-arhiva/ucenik-arhiva.component';
import { UcenikCasoviComponent } from './ruterkomponente/ucenik-casovi/ucenik-casovi.component';
import { UcenikObavestenjaComponent } from './ruterkomponente/ucenik-obavestenja/ucenik-obavestenja.component';
import { UcenikZakazivanjeComponent } from './ruterkomponente/ucenik-zakazivanje/ucenik-zakazivanje.component';
import { AdministratorNavigacijaComponent } from './subkomponente/administrator-navigacija/administrator-navigacija.component';
import { AdministratorKorisniciComponent } from './ruterkomponente/administrator-korisnici/administrator-korisnici.component';
import { AdministratorNastavnikComponent } from './ruterkomponente/administrator-nastavnik/administrator-nastavnik.component';
import { AdministratorUcenikComponent } from './ruterkomponente/administrator-ucenik/administrator-ucenik.component';
import { AdministratorZahteviComponent } from './ruterkomponente/administrator-zahtevi/administrator-zahtevi.component';
import { AdministratorPredmetiComponent } from './ruterkomponente/administrator-predmeti/administrator-predmeti.component';
import { NgChartsModule } from 'ng2-charts';
import { StatistikaBrojNastavnikaComponent } from './ruterkomponente/statistika-broj-nastavnika/statistika-broj-nastavnika.component';
import { StatistikaPolComponent } from './ruterkomponente/statistika-pol/statistika-pol.component';
import { StatistikaBrojCasovaComponent } from './ruterkomponente/statistika-broj-casova/statistika-broj-casova.component';
import { StatistikaAngazovanjeComponent } from './ruterkomponente/statistika-angazovanje/statistika-angazovanje.component';
import { SastanakComponent } from './ruterkomponente/sastanak/sastanak.component';
import { Chart } from 'chart.js';

@NgModule({
  declarations: [
    AppComponent,
    PrijavaComponent,
    RegistracijaComponent,
    FajlInputComponent,
    PrijavaNavigacijaComponent,
    PrijavaAdministratorComponent,
    ZaboravljenaLozinkaComponent,
    PromenaLozinkeComponent,
    OsajtuComponent,
    UcenikNavigacijaComponent,
    UcenikProfilComponent,
    ZvezdeComponent,
    UcenikNastavniciComponent,
    UcenikNastavnikComponent,
    KomentarComponent,
    VremeInputComponent,
    DatumVremeInputComponent,
    KalendarComponent,
    NastavnikProfilComponent,
    NastavnikNavigacijaComponent,
    NastavnikKalendarComponent,
    RadnovremeInputComponent,
    NastavnikCasoviComponent,
    NastavnikZahteviComponent,
    NastavnikUceniciComponent,
    NastavnikDosijeComponent,
    UcenikArhivaComponent,
    UcenikCasoviComponent,
    UcenikObavestenjaComponent,
    UcenikZakazivanjeComponent,
    AdministratorNavigacijaComponent,
    AdministratorKorisniciComponent,
    AdministratorNastavnikComponent,
    AdministratorUcenikComponent,
    AdministratorZahteviComponent,
    AdministratorPredmetiComponent,
    StatistikaBrojNastavnikaComponent,
    StatistikaPolComponent,
    StatistikaBrojCasovaComponent,
    StatistikaAngazovanjeComponent,
    SastanakComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
