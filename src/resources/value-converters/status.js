export class StatusValueConverter {
  toView(value) {
	if(value) {
		return 'Aktīvs';
	}
	return 'Neaktīvs';
  }
}

