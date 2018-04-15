export class NumberToDecimalValueConverter {
  toView(value) {
	return parseFloat(value).toFixed(2);
  }
}