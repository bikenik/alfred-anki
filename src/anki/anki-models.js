/* eslint-disable camelcase */
const alfy = require('alfy')
const jsonfile = require('jsonfile')

const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const ankiConnect = require('./anki-connect')

const note_type = alfy.config.get('default-model')

const fileAnkiModelFields = './src/input/anki-model-fields.json'

module.exports = async () => {
	try {
		const resultAll = await ankiConnect('modelNames', 6)
		return resultAll
	} catch (error) {
		alfy.cache.set('validOutput', 'false')
		throw new WorkflowError(error, errorAction('main'))
	}
}

module.exports.modelExist = async (model = note_type) => {
	try {
		alfy.cache.set('validOutput', 'true')
		const result = await ankiConnect('modelFieldNames', 6, {modelName: model})
		jsonfile.writeFile(fileAnkiModelFields, result, {
			spaces: 2
		}, error => {
			if (error !== null) {
				console.log(error)
			}
		})
		return result
	} catch (error) {
		alfy.cache.set('validOutput', 'false')
		return new WorkflowError(error, error === 'failed to connect to AnkiConnect' ? errorAction('main') : error === 'collection is not available' ? errorAction('profile') : /model was not found/.test(error) ? errorAction('modelExist') : errorAction('main'))
	}
}

module.exports.render = async (pattern = '', autocomplete = () => undefined, ankiDecks, cmdIcon) => {
	const out = await alfy.matches(pattern, ankiDecks)
		.map(name => ({
			title: name,
			subtitle: '',
			autocomplete: autocomplete(name),
			valid: false,
			icon: {
				path: cmdIcon
			}
		}))
	if (out.length === 0) {
		out.push({
			title: `Not found '${pattern}' module`,
			subtitle: `Old value ⇒ ${alfy.config.get('default-deck')}`,
			valid: true,
			arg: JSON.stringify({
				alfredworkflow: {
					variables: {
						action: 'model',
						config_variable_model: 'default-model',
						config_value: pattern
					}
				}
			})
		})
		return out
	}

	return out
}
