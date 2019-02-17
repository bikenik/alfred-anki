/* eslint-disable camelcase */
'use strict'
const jsonfile = require('jsonfile')
const alfy = require('alfy')

const config = require('../config')
const decks = require('../anki/anki-decks')
const models = require('../anki/anki-models')
const WorkflowError = require('../utils/error')
const {hasOwnProperty} = require('../utils')
const {cards, areDue, areSuspend} = require('../anki/anki-cards')

const fileAnkiCards = './src/input/anki-cards.json'
const fileAnkiModels = './src/input/anki-models.json'
const cards2Json = {}

const variables = {
	'refreshing...': {
		refresh: 'choose ...',
		outputOptions: decks
	}
}

const runUpdate = async () => {
	const ankiDecks = await decks()
	const ankiModels = await models()
	const ankiCardsCount = await cards(ankiDecks)
	/* eslint-disable no-await-in-loop */
	for (let i = 0; i < ankiCardsCount.length; i++) {
		const elem = await areDue(ankiCardsCount[i])
		const elem2 = await areSuspend(ankiCardsCount[i])
		let countFormat = elem.length.toString()
		let countNew = elem.filter(x => x).length.toString()
		while (countFormat.length <= 10) {
			countFormat += '  '
		}

		while (countNew.length <= 10) {
			countNew += '  '
		}

		cards2Json[`${ankiDecks[i]}`] = `\tCards: ${countFormat}New: ${countNew}Due: ${ankiCardsCount[i].length - elem
			.filter(x => x).length}\t\t${elem2.filter(x => x).length > 0 ? ` Suspend: ${elem2.filter(x => x).length}` : ''}`
	}

	/* eslint-enable no-await-in-loop */
	jsonfile.writeFile(fileAnkiCards, cards2Json, {
		spaces: 2
	}, error => {
		if (error !== null) {
			process.stderr.write(error)
		}
	})

	jsonfile.writeFile(fileAnkiModels, ankiModels, {
		spaces: 2
	}, error => {
		if (error !== null) {
			process.stderr.write(error)
		}
	})
}

if (process.argv[2] === 'runref') {
	runUpdate()
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.decks.refresh)

	const mapper = key => ({
		title: key,
		subtitle: pattern === '' ? 'Hit ↵ to refresh cards in decks | It will take a few seconds' : 'hold on, your collection will be update',
		valid: false,
		autocomplete: '!refresh refreshing... ',
		icon: {path: './icons/refresh.png'}
	})

	const out = alfy.matches(pattern, Object.keys(config.decks.refresh)).map(mapper)

	return out.length === 0 ? vars.map(mapper) : out
}

module.exports = async input => {
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
			autocomplete: '!refresh '
		})
	}

	const value = chunks.slice(2).join(' ')
	if (chunks.length >= 3) {
		return [{
			title: 'Collection updated',
			subtitle: 'hit ↵ to go settings',
			valid: false,
			autocomplete: '!',
			arg: JSON.stringify({
				alfredworkflow: {
					autocomplete: '!',
					variables: {
						action: 'refresh',
						config_variable: variableName,
						config_value: value
					},
					arg: await runUpdate()
				}
			}),
			icon: {
				path: './icons/warning.png'
			}
		}]
	}
}

module.exports.meta = {
	name: '!refresh',
	usage: '!refresh to another deck',
	help: 'Refreshing decks by Anki-Connect.',
	autocomplete: '!refresh ',
	icon: {path: './icons/refresh.png'}
}

module.exports.match = input => {
	return input.indexOf('!refresh') === 0
}

module.exports.update = runUpdate
