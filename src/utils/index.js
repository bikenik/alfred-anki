const alfy = require('alfy')

/* eslint-disable no-extend-native */
/* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
String.prototype.replaceAll = function (search, replacement) {
	const target = this
	return target.replace(new RegExp(search, 'gi'), replacement)
}

/* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
Array.prototype.last = function () {
	return this[this.length - 1]
}
/* eslint-enable no-extend-native */

module.exports = {
	wordOfURL: alfy.config.get('wordOfURL')
}

module.exports.capitalize = x =>
	x.charAt(0).toUpperCase() + x.slice(1)

module.exports.hasOwnProperty = (obj, prop) =>
	Object.prototype.hasOwnProperty.call(obj, prop)
