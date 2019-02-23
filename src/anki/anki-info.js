const alfy = require('alfy')
const jsonfile = require('jsonfile')
const WorkflowError = require('../utils/error')
const decks = require('../anki/anki-decks')
const {errorAction} = require('../utils/error')
const {modelExist} = require('./anki-models')

const fileAnkiDecks = './src/input/anki-decks.json'

module.exports = async () => {
	const introMessage = [{
		subtitle: `🧰 ⇒ ${alfy.config.get('default-deck')} | ⚒ ⇒ ${alfy.config.get('default-model')} | press ↹ to choose another deck`
	}]
	introMessage[0].title = 'Create new card (⌘ + ↵)'
	introMessage[0].icon = {path: './icons/anki.png'}
	introMessage[0].autocomplete = '!deck default-deck '
	introMessage[0].valid = false
	introMessage[0].arg = ''
	introMessage[0].quicklookurl = `${process.env.PWD}/src/input/preview/preview.html`
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
				action: 'make-new-card'
			}
		}
	}

	const ankiModelExist = await modelExist()
	if (ankiModelExist && ankiModelExist.message) {
		return ankiModelExist
	}

	if (!ankiModelExist) {
		return errorAction('modelExist')
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
