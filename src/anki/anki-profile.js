const alfy = require('alfy')
const ankiConnect = require('./anki-connect')

module.exports = async () => {
	try {
		const getProfileName = await ankiConnect('loadProfileName', 6)
		alfy.config.set('profile-name', getProfileName)
		return getProfileName
	} catch (error) {
		if (error === 'unsupported action') {
			const profileName = process.env.profile_name
			alfy.config.set('profile-name', profileName)
			return profileName
		}

		return error
	}
}
