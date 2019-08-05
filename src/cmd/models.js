/* eslint-disable capitalized-comments */

const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {hasOwnProperty} = require('../utils')
const config = require('../config').cmd
const models = require('../anki/anki-models')

const ankiModels = require(`${process.env.alfred_workflow_data}/anki-models.json`)

const variables = {
	'default-model': {
		models: 'Basic',
		outputOptions: models
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.models)

	const mapper = key => ({
		title: `${key} ⇒ ${
			Object.keys(alfy.config.get(key))[0] === undefined ? config.models['default-model'] : Object.keys(alfy.config.get(key))[0]}`,
		subtitle: '↵ pick out another model...',
		valid: false,
		autocomplete: `!model ${key} `,
		icon: {path: './icons/Model.png'}
	})

	const out = alfy.matches(pattern, Object.keys(config.models)).map(mapper)

	return out.length === 0 ? vars.map(mapper) : out
}

module.exports = input => {
	if (typeof input !== 'string') {
		throw new TypeError('input should be a string')
	}

	const chunks = input.split(' ')

	if (chunks.length === 1) {
		return outputVariables()
	}

	if (chunks.length === 2) {
		return outputVariables(chunks[1])
	}

	const variableName = chunks[1]

	// Throw if variable is invalid
	if (!hasOwnProperty(variables, variableName)) {
		throw new WorkflowError(`Variable '${variableName}' does not exist`, {
			autocomplete: '!model '
		})
	}
	// for (let i = 2; i < chunks.length; i++) {
	// 	chunks[i] = chunks[i].charAt(0).toUpperCase() + chunks[i].slice(1)
	// }

	// value.split('-').forEach(x => {x.charAt(0).toUpperCase() + x.slice(1)}).join('-'),
	const variable = variables[variableName]
	const value = chunks.slice(2).join(' ')
	const arrayOfDecks = ankiModels

	if (chunks.length >= 3) {
		return (async () => {
			if (await models() === null) {
				throw new WorkflowError('Models was not found, check your Anki profile', errorAction('!model models'))
			}

			if (Object.getOwnPropertyNames(arrayOfDecks).indexOf(value) === -1) {
				return variable.outputOptions.render(
					value,
					name => `!model ${variableName} ${name}`,
					arrayOfDecks,
					'./icons/Model.png'
				)
			}

			return [{
				title: `Set ${variableName} to '${value}'`,
				subtitle: `Old value ⇒ ${alfy.config.get(variableName)}`,
				valid: true,
				arg: JSON.stringify({
					alfredworkflow: {
						variables: {
							action: 'set',
							/* eslint-disable camelcase */
							config_variable_model: variableName,
							config_value: JSON.stringify({
								[value]: arrayOfDecks[value].toString()
							})
							/* eslint-enable camelcase */
						}
					}
				})
			}]
		})()
	}
}

module.exports.meta = {
	name: '!model',
	usage: '!model to another Model',
	help: 'Pick out the model by the given value.',
	autocomplete: '!model ',
	icon: {path: './icons/Model.png'}
}

module.exports.match = input => {
	return input.indexOf('!model') === 0
}
