import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'zvezde',
  templateUrl: './zvezde.component.html',
  styleUrls: ['./zvezde.component.css']
})
export class ZvezdeComponent {

  @Input() broj: number = 0;
  @Input() visina: string = "30px";

  @Output() naKlik: EventEmitter<any> = new EventEmitter();

  niz(od: number, do_: number) {
    let res = []
    if (do_ < od) return [];
    for (let i = od; i <= do_; i++) res.push(i);
    return res;
  }

  klik(i: number) {
    this.naKlik.emit(i);
  }
}
