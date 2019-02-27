/* eslint-disable camelcase */
const alfy = require('alfy')

const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const ankiConnect = require('./anki-connect')

module.exports = () => {
	const outresult = async function () {
		try {
			alfy.cache.set('validOutput', 'true')
			const resultAll = await ankiConnect('deckNames', 6)
			return resultAll
		} catch (error) {
			alfy.cache.set('validOutput', 'false')
			throw new WorkflowError(error, error === 'failed to connect to AnkiConnect' ? errorAction('main') : error === 'collection is not available' ? errorAction('profile') : /model was not found/.test(error) ? errorAction('modelExist') : errorAction('main'))
		}
	}

	return outresult()
}

module.exports.render = async (pattern = '', autocomplete = () => undefined, ankiDecks, cmdIcon) => {
	const out = await alfy.matches(pattern, Object.getOwnPropertyNames(ankiDecks).sort())
		.map(name => ({
			title: name,
			subtitle: ankiDecks[name],
			autocomplete: autocomplete(name),
			valid: false,
			icon: {
				path: cmdIcon
			}
		}))
	if (out.length === 0) {
		out.push({
			title: `Create new Deck as '${pattern}'`,
			subtitle: `Old value ⇒ ${alfy.config.get('default-deck')}`,
			valid: true,
			arg: JSON.stringify({
				alfredworkflow: {
					variables: {
						action: 'set',
						config_variable_deck: 'default-deck',
						config_value: pattern
					}
				}
			})
		})
		return out
	}

	return out
}
