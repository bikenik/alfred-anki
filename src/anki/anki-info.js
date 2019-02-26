const alfy = require('alfy')
const jsonfile = require('jsonfile')
const WorkflowError = require('../utils/error')
const decks = require('../anki/anki-decks')
const {errorAction} = require('../utils/error')
const config = require('../config').card
const {modelExist} = require('./anki-models')

const fileAnkiDecks = './src/input/anki-decks.json'
const model = alfy.config.get('default-model') ? Object.keys(alfy.config.get('default-model'))[0] : null

module.exports = async () => {
	const introMessage = [{
		subtitle: alfy.config.get('default-deck') ? `🧰 ⇒ ${alfy.config.get('default-deck')}\t\t⚒ ⇒ ${model}\t\t👤 ${alfy.config.get('profile-name')}` : '',
		title: alfy.config.get('default-deck') ? 'Create new card (⌘ + ↵)' : 'press ↵ or ↹ to select default deck',
		icon: {path: './icons/anki.png'},
		autocomplete: '!deck default-deck ',
		valid: false,
		arg: '',
		quicklookurl: `${config.mediaDir}/_preview.html`,
		mods: {
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
	}]
	const ankiModelExist = await modelExist()
	if (ankiModelExist && ankiModelExist.message) {
		return [ankiModelExist]
	}

	if (!ankiModelExist) {
		return [errorAction('modelExist')]
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
