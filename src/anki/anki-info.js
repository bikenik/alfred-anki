/* eslint-disable camelcase */
const alfy = require('alfy')
const jsonfile = require('jsonfile')
const WorkflowError = require('../utils/error')
const decks = require('../anki/anki-decks')
const {errorAction} = require('../utils/error')
const header = require('../input/header.json')
const {modelExist} = require('./anki-models')

const fileAnkiDecks = './src/input/anki-decks.json'

module.exports = async () => {
	const checkEmtyField_1 = header[0].Front && header[0].Front.length > 0
	const checkEmtyField_2 = header[0].Back && header[0].Back.length > 0
	const introMessage = [{
		subtitle: `🧰 ⇒ ${alfy.config.get('default-deck')} | ⚒ ⇒ ${alfy.config.get('default-model')} | press ↹ to choose another deck`
	}]
	introMessage[0].title = 'Create new card (⌘ + ↵)'
	introMessage[0].icon = {path: './icons/anki.png'}
	introMessage[0].autocomplete = '!deck default-deck '
	introMessage[0].valid = false
	introMessage[0].arg = ''
	introMessage[0].mods = {
		alt: {
			subtitle: '❌ RESET',
			valid: true,
			variables: {
				action: 'reset'
			},
			arg: ''
		},
		cmd: {
			valid: true,
			subtitle: '🎉 \t   Add New Card \t🎉',
			variables: {
				action: checkEmtyField_1 && checkEmtyField_2 ? 'make-new-card' : false
			}
		}
	}

	const ankiModelExist = await modelExist()
	if (ankiModelExist && ankiModelExist.message) {
		return ankiModelExist
	}

	if (!ankiModelExist) {
		return errorAction('main')
	}

	const ankiDecks = await decks()
	if (ankiDecks === null) {
		throw new WorkflowError('Decks was not found, check your Anki profile', errorAction('profile'))
	}

	jsonfile.writeFile(fileAnkiDecks, ankiDecks, {
		spaces: 2
	}, error => {
		if (error !== null) {
			console.log(error)
		}
	})
	return introMessage
}
