import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrijavaComponent } from './ruterkomponente/prijava/prijava.component';
import { RegistracijaComponent } from './ruterkomponente/registracija/registracija.component';
import { ZaboravljenaLozinkaComponent } from './ruterkomponente/zaboravljena-lozinka/zaboravljena-lozinka.component';
import { PrijavaAdministratorComponent } from './ruterkomponente/prijava-administrator/prijava-administrator.component';
import { PromenaLozinkeComponent } from './ruterkomponente/promena-lozinke/promena-lozinke.component';

const routes: Routes = [
  { path: "prijava", component: PrijavaComponent},
  { path: "registracija", component: RegistracijaComponent},
  { path: "prijavaAdministrator", component: PrijavaAdministratorComponent},
  { path: "zaboravljenaLozinka", component: ZaboravljenaLozinkaComponent},
  { path: "promenaLozinke", component: PromenaLozinkeComponent},
  { path: "", component: PrijavaComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
