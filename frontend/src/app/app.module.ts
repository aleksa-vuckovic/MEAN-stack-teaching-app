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

@NgModule({
  declarations: [
    AppComponent,
    PrijavaComponent,
    RegistracijaComponent,
    FajlInputComponent,
    PrijavaNavigacijaComponent,
    PrijavaAdministratorComponent,
    ZaboravljenaLozinkaComponent,
    PromenaLozinkeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
