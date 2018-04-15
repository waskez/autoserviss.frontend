export class LevelToBadgeValueConverter {
	toView(value) {
		if (value === 'Information') {
			return 'success';
		} else if (value === 'Warning') {
			return 'warning';
		} else if (value === 'Error') {
			return 'danger'
		} else {
			return 'default';
		}
	}
}

