export class CustomerEmailValueConverter {
  toView(value) {
	if(value) {
		return value;
	}
	return 'Nav norādīta e-pasta adrese';
  }
}

