export function countLabel(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let form = forms[2];
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) form = forms[0];
    else if (mod10 >= 2 && mod10 <= 4) form = forms[1];
  }
  return `${n} ${form}`;
}

export const placeForms: [string, string, string] = ['место', 'места', 'мест'];
export const hotelForms: [string, string, string] = ['отель', 'отеля', 'отелей'];
