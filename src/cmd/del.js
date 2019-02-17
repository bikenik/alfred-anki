/* eslint-disable capitalized-comments */
/* eslint-disable camelcase */

const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {hasOwnProperty} = require('../utils')
const config = require('../config')
const decks = require('../anki/anki-decks')
// const arrayOfDecks = require('../input/anki-decks.json')
const ankiCards = require('../input/anki-cards.json')
// const {launch} = require('./cards-info-launch')

const variables = {
	'delete-deck': {
		delete: 'choose ...',
		outputOptions: decks
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.decks.delete)

	const mapper = key => ({
		title: key,
		subtitle: `current deck is ⇒ ${alfy.config.get('default-deck')} | ↵ choose this or pick out another`,
		valid: false,
		autocomplete: `!del ${key} `,
		icon: {path: './icons/delete.png'}
	})

	const out = alfy.matches(pattern, Object.keys(config.decks.delete)).map(mapper)

	return out.length === 0 ? vars.map(mapper) : out
}

module.exports = input => {
	// !del command value

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
			autocomplete: '!del '
		})
	}

	const variable = variables[variableName]
	const value = chunks.slice(2).join(' ')
	const arrayOfDecks = ankiCards

	if (chunks.length >= 3) {
		return (async () => {
			if (await decks() === null) {
				throw new WorkflowError('Decks was not found, check your Anki profile', errorAction('!del decks'))
			}

			if (Object.getOwnPropertyNames(arrayOfDecks).indexOf(value) === -1) {
				return variable.outputOptions.render(
					value,
					name => `!del ${variableName} ${name}`,
					arrayOfDecks,
					'./icons/del.png'
				)
			}

			return [{
				title: `The deck [${value}] will be deleted`,
				subtitle: 'All cards in this deck will be deleted. Are you sure?',
				valid: true,
				arg: JSON.stringify({
					alfredworkflow: {
						variables: {
							action: 'del',
							config_variable: variableName,
							config_value: value
						}
					}
				}),
				icon: {
					path: './icons/warning.png'
				}
			}]
		})()
	}
}

module.exports.meta = {
	name: '!del',
	usage: '!delete any your deck',
	help: 'Delete deck by the given value.',
	autocomplete: '!del ',
	icon: {path: './icons/delete.png'}
}

module.exports.match = input => {
	return input.indexOf('!del') === 0
}
