/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable camelcase */
const os = require('os')
const {modelExist} = require('../anki/anki-models')

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

const user = os.userInfo()
const {path_to_ankiMedia} = process.env
const fields = {}

for (const field of modelFieldNames) {
	fields[field] = field
}

module.exports = {
	concurrency: 10,
	input: './src/input/header.json',
	fields,
	get mediaDir() {
		return user.homedir + path_to_ankiMedia
	},
	decks: {
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
}
