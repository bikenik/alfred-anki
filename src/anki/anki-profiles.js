/* eslint-disable camelcase */
const alfy = require('alfy')
const jsonfile = require('jsonfile')

const ankiConnect = require('./anki-connect')

const fileAnkiProfiles = './src/input/anki-profiles.json'

module.exports = async () => {
	try {
		const result = await ankiConnect('loadProfile', 6,
			{name: alfy.config.get('default-profile') ? alfy.config.get('default-profile') : 'Hello world'})

		jsonfile.writeFile(fileAnkiProfiles, result === false ? [] : typeof (result) === 'boolean' ? [] : result, {
			spaces: 2
		}, error => {
			if (error !== null) {
				console.log(error)
			}
		})
		return result
	} catch (error) {
		return error
	}
}

module.exports.render = async (pattern = '', autocomplete = () => undefined, ankiDecks, cmdIcon) => {
	const out = await alfy.matches(pattern, ankiDecks)
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
			title: `Profile name is '${pattern}'`,
			subtitle: `Old value ⇒ ${alfy.config.get('default-profile')}`,
			valid: true,
			arg: JSON.stringify({
				alfredworkflow: {
					variables: {
						action: 'set',
						config_variable_profile: 'default-profile',
						config_value: pattern
					}
				}
			})
		})
		return out
	}

	return out
}
