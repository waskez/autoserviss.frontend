export class Helpers {

	isDate(obj) {
		return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
	}

	isISODate(value) {
		let date = new Date(value);
		return date != 'Invalid Date';
	}

	//TODO: string validācija
	dateStringToISO(value) {
		let parts = value.split('.');
        /*if(parts.length !== 3) {
            return 'Invalid Date';
        }*/
		let date = new Date(parts[2], parts[1] - 1, parts[0]); // mēneši sākas no 0
		return date.toISOString();
	}

	stringToDate(value) {
		let parts = value.split('.');
        /*if(parts.length !== 3) {
            return 'Invalid Date';
        }*/
		return new Date(parts[2], parts[1] - 1, parts[0]); // mēneši sākas no 0
	}

	dateToString(date) {
		if (this.isDate(date)) {
			const year = date.getFullYear()
				, month = date.getMonth() + 1
				, day = date.getDate()
				, formattedDate = [
					day < 10 ? '0' + day : day
					, month < 10 ? '0' + month : month
					, year
				].join('.');
			return formattedDate;
		}
		return '';
	}

	dateTimeToString(date, s) {
		if (this.isDate(date)) {
			const year = date.getFullYear()
				, month = date.getMonth() + 1
				, day = date.getDate()
				, hours = date.getHours()
				, minutes = date.getMinutes()
				, seconds = date.getSeconds()
				, formattedDate = [
					day < 10 ? '0' + day : day
					, month < 10 ? '0' + month : month
					, year
				].join('.')
				, formatedTime = [
					hours < 10 ? '0' + hours : hours
					, minutes < 10 ? '0' + minutes : minutes
					, seconds < 10 ? '0' + seconds : seconds
				].join(':');
			return formattedDate + ' ' + formatedTime;
		}
		return '';
	}

	replaceDiacritics(str) {
		var convMap = {
			"ā": "a",
			"č": "c",
			"ē": "e",
			"ģ": "g",
			"ī": "i",
			"ķ": "k",
			"ļ": "l",
			"ņ": "n",
			"š": "s",
			"ū": "u",
			"ž": "z"
		}
		for (var i in convMap) {
			str = str.replace(new RegExp(i, "g"), convMap[i]);
		}
		return str;
	}

	addError(id, focus) {
		let element = document.getElementById(id);
		if (element) {
			element.classList.add('is-invalid');
			if (focus) {
				element.focus();
			}
		}		
	}

	removeError(id) {
		let element = document.getElementById(id);
		if (element) {
			element.classList.remove('is-invalid');
		}
	}

	validateEmail(email) {
		let regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

	validatePassword(id, password, focus) {
		let errors = 0;
		if (password.length < 6) {
			errors++;
		}
		if (!hasNumbers(password)) {
			errors++;
		}
		if (!hasSpecialCharacters(password)) {
			errors++;
		}

		if(errors == 0) {
			this.removeError(id);
			return true;
		} else {
			this.addError(id, focus);
			return false;
		}
	}
}

function hasNumbers(t) {
	var regex = /\d/g;
	return regex.test(t);
}

function hasSpecialCharacters(t) {
	let regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
	return regex.test(t);
}