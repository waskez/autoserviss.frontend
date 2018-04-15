export class CustomerAddressValueConverter {
  toView(value) {
	if(value && value.length > 0) {
		if(value[0].hasOwnProperty('nosaukums')) {
			return value[0].nosaukums;
		}
	}
	return 'Nav norādīta adrese';
  }
}