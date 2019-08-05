/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable camelcase */
const os = require('os')
const fs = require('fs-extra')

const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const ankiConnect = require('../anki/anki-connect')

const createJsonFile = async db => {
	try {
		await fs.readJson(db)
	} catch {
		try {
			await fs.outputJson(db, [])
		} catch (error) {
			throw new WorkflowError(error.stack)
		}
	}
}

const envOfWF = process.env.alfred_workflow_data
createJsonFile(`${envOfWF}/anki-cards.json`)
createJsonFile(`${envOfWF}/anki-decks.json`)
createJsonFile(`${envOfWF}/anki-model-fields.json`)
createJsonFile(`${envOfWF}/anki-models.json`)
createJsonFile(`${envOfWF}/anki-profiles.json`)
createJsonFile(`${envOfWF}/header.json`)

const modelFieldNames = require(`${process.env.alfred_workflow_data}/anki-model-fields.json`)

const user = os.userInfo()

const getProfileName = async () => {
	const getProfileName = fs.existsSync(`${user.homedir}/Library/Application Support/Anki2/${alfy.config.get('default-profile')}/collection.media`) ? alfy.config.get('default-profile') : false
	if (typeof (getProfileName) === 'string') {
		try {
			await ankiConnect('loadProfile', 6, {name: alfy.config.get('default-profile')})
		} catch (error) {
			throw new WorkflowError(error, errorAction('main'))
		}
	} else {
		alfy.config.set('default-profile', getProfileName)
	}
}

const path_to_ankiMedia = () => alfy.config.get('default-profile') ? `/Library/Application Support/Anki2/${alfy.config.get('default-profile')}/collection.media/` : ''

const fields = () => {
	const fields = {}
	modelFieldNames.forEach(x => {
		fields[x] = x
	})
	return fields
}

const card = {
	concurrency: 10,
	input: `${process.env.alfred_workflow_data}/header.json`,
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
	},
	profiles: {
		'default-profile': 'choose ...'
	},
	reset: {
		'reseting...': 'reset it ...'
	}
}

module.exports = {getProfileName, card, cmd}
