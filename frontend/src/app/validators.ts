import { AbstractControl, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

export function fajlTipValidator(tipovi: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const fajl = control.value as File;
    if (fajl) {
      let tip = fajl.type.split('/')[1].toLowerCase();
      if (tipovi.indexOf(tip) === -1) {
        return { 'fajlTip': true };
      }
      else return null;
    }
    return null;
  };
}

export function fajlVelicinaValidator(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value as File;
      if (file) {
        const velicina = file.size / 1024;
        if (velicina > max) {
          return { 'fajlVelicina': true };
        }
      }
      return null;
    };
  }

  export function fajlVisinaSirinaValidator(maxVisina: number, maxSirina: number, minVisina: number, minSirina: number): AsyncValidatorFn {
    return (control: AbstractControl): Promise<{[key:string]: any} | null> => {
      const fajl = control.value as File;
  
      if (!fajl || !fajl.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {resolve(null)})
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;

        
        image.onload = () => {
            if (image.width > maxSirina || image.height > maxVisina || image.width < minSirina || image.height < minVisina) {
            resolve({ 'fajlVisinaSirina': true });
            } else {
            resolve(null);
            }
        };

        image.onerror = () => {
            reject({ 'fajlVisinaSirina': true });
        };
        };

        reader.readAsDataURL(fajl);
      });
    };
  }