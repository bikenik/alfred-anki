/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const alfy = require('alfy')
const ankiConnect = require('./anki-connect')
const decks = require('./anki-decks')

const nameOfDeck = alfy.config.get('default-deck')
const {note_type} = process.env

const logResult = {
	error: [],
	result: []
}

module.exports = async function (output) {
	/* eslint-disable no-await-in-loop */
	for (let i = 0; i < output.length; i++) {
		if (output[i].Homnum) {
			output[i].Headword = `${output[i].Headword}<span class="HOMNUM-title">${
				output[i].Homnum.toString()}</span>`
		}

		delete output[i].Inflections // Can't understood the reason of error without delete

		if (output[i].Definition !== 'notfound' && output[i].Definition !== '') {
			try {
				const result1 = await ankiConnect(
					'createDeck', 6,
					{
						deck: nameOfDeck
					})
			} catch (error) {
				logResult.error.push(error)
			}

			try {
				const result2 = await ankiConnect(
					'addNote', 6,
					{
						note: {
							deckName: nameOfDeck,
							modelName: note_type,
							fields: output[i],
							tags: [output[i].Tag]
						}
					})
				logResult.result.push(`\n${nameOfDeck}: ${result2}`)
			} catch (error) {
				logResult.error.push(error)
			}
		}
	}

	/* eslint-enable no-await-in-loop */
	if (logResult.error.length > 0) {
		logResult.error.forEach(error => {
			process.stdout.write(`!err: ${error}`)
		})
	} else {
		process.stdout.write(logResult.result.length > 1 ? `in the number of: ${logResult.result.length.toString()} items` : logResult.result[0])
	}
}

module.exports.canAddNotes = async function (check) {
	const ankiDecks = await decks()
	/* eslint-disable no-await-in-loop */
	for (let i = 0; i < check.length; i++) {
		const currentFields = {
			Headword: `${check[i].Headword}${check[i].Homnum ? `<span class="HOMNUM-title">${
				check[i].Homnum.toString()}</span>` : ''}`,
			Audio: '',
			Translation: '',
			Example: '',
			Image: '',
			Verb_table: '',
			Tag: [check[i].Part_of_speech]
		}
		try {
			const result = await ankiConnect(
				'canAddNotes', 6,
				{
					notes: [{
						deckName: ankiDecks[0],
						modelName: note_type,
						fields: currentFields,
						tags: [currentFields.Tag]
					}]
				})
			return result
		} catch (error) {
			return error
		}
	}
	/* eslint-enable no-await-in-loop */
}
