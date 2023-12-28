import { Component, Input } from '@angular/core';

@Component({
  selector: 'komentar',
  templateUrl: './komentar.component.html',
  styleUrls: ['./komentar.component.css']
})
export class KomentarComponent {

  @Input() ocena: number = 0
  @Input() slika: string = ""
  @Input() naslov: string = ""
  @Input() sadrzaj: string = ""

  
}
