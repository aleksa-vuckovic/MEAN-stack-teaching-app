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
    DatumVremeInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
