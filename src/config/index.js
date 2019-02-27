/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable camelcase */
const fs = require('fs')
const os = require('os')
const alfy = require('alfy')
const {modelExist} = require('../anki/anki-models')
const ankiConnect = require('../anki/anki-connect')

const user = os.userInfo()

const getProfileName = async () => {
	try {
		const getProfileName = await ankiConnect('loadProfileName', 6)
		if (alfy.config.get('profile-name') !== getProfileName) {
			alfy.config.set('profile-name', getProfileName)
			alfy.cache.set('new-profile', true)
			alfy.cache.set('refresh-done', false)
		}
	} catch (error) {
		if (error === 'unsupported action') {
			const getProfileName = fs.existsSync(`${user.homedir}/Library/Application Support/Anki2/${process.env.profile_name}/collection.media`) ? process.env.profile_name : false
			alfy.config.set('profile-name', getProfileName)
		}
	}
}

/* -----------------------------
To prevent unknown case that invokes this error when settings new deck or model
with many random charachters which typing very quickly.
> "SyntaxError: alfred-anki/src/input/anki-model-fields.json: Unexpected end of JSON input"
------------------------------- */
let modelFieldNames
try {
	modelFieldNames = require('../input/anki-model-fields.json')
} catch (error) {
	(async () => {
		await modelExist()
	})()
}
/* --------------------------- */

const path_to_ankiMedia = () => alfy.config.get('profile-name') ? `/Library/Application Support/Anki2/${alfy.config.get('profile-name')}/collection.media/` : ''

const fields = () => {
	const fields = {}
	modelFieldNames.forEach(x => {
		fields[x] = x
	})
	return fields
}

const card = {
	concurrency: 10,
	input: './src/input/header.json',
	fields: fields(),
	get mediaDir() {
		return user.homedir + path_to_ankiMedia()
	}
}

const cmd = {
	defaults: {
		'default-deck': 'Default'
	},
	delete: {
		'delete-deck': 'choose ...'
	},
	refresh: {
		'refreshing...': 'refreshings ...'
	},
	theme: {
		'change theme': 'toogle ...'
	},
	models: {
		'default-model': 'choose ...'
	}
}

module.exports = {getProfileName, card, cmd}
