export class DefectsFilterValueConverter {
	toView(items, type) {
		if (type === '' || type === undefined) return items;
		if(items) {
			return items.filter((item) => item.veids === type);
		}
		return items;		
	}
}