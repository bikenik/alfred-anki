const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {hasOwnProperty} = require('../utils')
const config = require('../config').cmd
const profiles = require('../anki/anki-profiles')

const ankiProfiles = require('../input/anki-profiles.json')

const variables = {
	'default-profile': {
		profiles: 'User 1',
		outputOptions: profiles
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.profiles)

	const mapper = key => ({
		title: `${key} ⇒ ${
			alfy.config.get(key) === undefined ? config.profiles['default-profile'] : alfy.config.get(key)}`,
		subtitle: '↵ pick out another profile...',
		valid: false,
		autocomplete: `!profile ${key} `,
		icon: {path: './icons/Profile.png'}
	})

	const out = alfy.matches(pattern, Object.keys(config.profiles)).map(mapper)

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
			autocomplete: '!profile '
		})
	}

	const variable = variables[variableName]
	const value = chunks.slice(2).join(' ')
	const arrayOfProfiles = ankiProfiles

	if (chunks.length >= 3) {
		variable.outputOptions()
		return (async () => {
			if (await profiles() === null) {
				throw new WorkflowError('Profiles was not found, type excisting name', errorAction('!profile profiles'))
			}

			if (Object.values(arrayOfProfiles).indexOf(value) === -1) {
				return variable.outputOptions.render(
					value,
					name => `!profile ${variableName} ${name}`,
					arrayOfProfiles,
					'./icons/Profile.png'
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
							config_variable_profile: variableName,
							config_value: value
							/* eslint-enable camelcase */
						}
					}
				})
			}]
		})()
	}
}

module.exports.meta = {
	name: '!profile',
	usage: '!profile to another Profile',
	help: 'Pick out the profile by the given value.',
	autocomplete: '!profile ',
	icon: {path: './icons/Profile.png'}
}

module.exports.match = input => {
	return input.indexOf('!profile') === 0
}
