const ankiConnect = require('./anki-connect')

module.exports.getTags = async () => {
	try {
		const getTags = await ankiConnect('getTags', 6)
		return getTags
	} catch (error) {
		return error
	}
}
