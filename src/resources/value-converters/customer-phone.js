export class CustomerPhoneValueConverter {
  toView(value) {
	if(value) {
		return value;
	}
	return 'Nav norādīts tālruņa numurs';
  }
}