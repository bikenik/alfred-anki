/* eslint curly: ["error", "multi-line"] */
'use strict'
const alfy = require('alfy')
const jsonfile = require('jsonfile')

const config = require('../config').cmd
const WorkflowError = require('../utils/error')
const {hasOwnProperty} = require('../utils')

const fileHeader = './src/input/header.json'
const fileDecks = './src/input/anki-decks.json'
const fileCards = './src/input/anki-cards.json'
const fileModelFields = './src/input/anki-model-fields.json'
const fileModels = './src/input/anki-models.json'
const fileProfiles = './src/input/anki-profiles.json'

const variables = {
	'reseting...': {
		refresh: 'reset it ...'
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) pattern = ''

	const vars = Object.keys(config.reset)

	const mapper = key => ({
		title: key,
		subtitle: pattern === '' ? 'Hit ↵ to reset all previous settings' : 'hold on...',
		valid: false,
		autocomplete: '!reset reseting... ',
		icon: {path: './icons/Reset.png'}
	})

	const out = alfy.matches(pattern, Object.keys(config.reset)).map(mapper)

	return out.length === 0 ? vars.map(mapper) : out
}

module.exports = async (input = '!reset reseting... ') => {
	// !refresh command value

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
			autocomplete: '!reset '
		})
	}

	if (chunks.length >= 3) {
		const reset = () => {
			alfy.config.clear()
			alfy.cache.clear()
			jsonfile.writeFile(fileHeader, {}, {spaces: 2}, error => {
				if (error) throw new WorkflowError(error)
			})
			jsonfile.writeFile(fileDecks, ['Default'], {spaces: 2}, error => {
				if (error) throw new WorkflowError(error)
			})
			jsonfile.writeFile(fileCards, {}, {spaces: 2}, error => {
				if (error) throw new WorkflowError(error)
			})
			jsonfile.writeFile(fileModelFields, [], {spaces: 2}, error => {
				if (error) throw new WorkflowError(error)
			})
			jsonfile.writeFile(fileModels, {}, {spaces: 2}, error => {
				if (error) throw new WorkflowError(error)
			})
			jsonfile.writeFile(fileProfiles, {}, {spaces: 2}, error => {
				if (error) throw new WorkflowError(error)
			})
		}

		return [{
			title: 'WF config was reset',
			subtitle: 'hit ↵ to go settings',
			valid: false,
			autocomplete: '!',
			arg: JSON.stringify({
				alfredworkflow: {
					autocomplete: '!',
					arg: reset()
				}
			}),
			icon: {
				path: './icons/Reset.png'
			}
		}]
	}
}

module.exports.meta = {
	name: '!reset',
	usage: '!reset all config',
	help: 'Reseting all settings to default',
	autocomplete: '!reset ',
	icon: {path: './icons/Reset.png'}
}

module.exports.match = input => {
	return input.indexOf('!reset') === 0
}
