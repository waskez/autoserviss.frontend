import velocity from "velocity-animate";

export class Notify {

	show(message, style) {
		let contentStyle = [
			'position: fixed;',
			'top: 5px;',
			'right: 5px;',
			'color: #fff;',
			'padding: 20px;',
			'width: 300px;',
			'z-index: 1030;'
		].join('');

		let notifyElement = document.createElement('div');
		//notifyElement.className = 'animate fadeIn';
		notifyElement.style = contentStyle + style;
		notifyElement.innerHTML = message;
		document.body.appendChild(notifyElement);

		velocity(notifyElement, 'fadeIn');

		window.setTimeout(function () {
			velocity(notifyElement, 'fadeOut').then(() => {
				notifyElement.parentNode.removeChild(notifyElement);
			});
		}, 3000);
	}

	success(message) {
		let style = [
			'background-color: #5cb85c;',
			'border-color: #4cae4c;'
		].join('');
		this.show(message, style);
	}

	info(message) {
		let style = [
			'background-color: #5bc0de;',
			'border-color: #46b8da;'
		].join('');
		this.show(message, style);
	}

	warn(message) {
		let style = [
			'background-color: #f0ad4e;',
			'border-color: #eea236;'
		].join('');
		this.show(message, style);
	}

	error(message) {
		let style = [
			'background-color: #d9534f;',
			'border-color: #d43f3a;'
		].join('');
		this.show(message, style);
	}
}