'use strict'
const fs = require('fs-extra')
const alfy = require('alfy')

const config = require('../config').cmd
const WorkflowError = require('../utils/error')
const {hasOwnProperty} = require('../utils')

const variables = {
	'toogle...': {
		theme: 'toogle...'
	}
}

const copyFiles = async () => {
	try {
		switch (alfy.config.get('theme')) {
			case 'dark':
				alfy.config.set('theme', 'light')
				await fs.copy(`${process.env.PWD}/icons/for-light-theme/`, `${process.env.PWD}/icons/`)
				break
			case 'light':
				alfy.config.set('theme', 'dark')
				await fs.copy(`${process.env.PWD}/icons/for-dark-theme/`, `${process.env.PWD}/icons/`)
				break

			default:
				alfy.config.set('theme', 'dark')
				await fs.copy(`${process.env.PWD}/icons/for-dark-theme/`, `${process.env.PWD}/icons/`)
				break
		}
	} catch (error) {
		process.stderr.write(error)
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.refresh)

	const mapper = key => ({
		title: key,
		subtitle: pattern === '' ? 'Hit ↵ to toogle current theme dark / light' : 'hold on...',
		valid: false,
		autocomplete: '!theme toogle... ',
		icon: {path: './icons/night_and_day.png'}
	})

	const out = alfy.matches(pattern, Object.keys(config.theme)).map(mapper)

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
			autocomplete: '!toogle'
		})
	}

	if (chunks.length >= 3) {
		return [{
			title: 'Icons have been overwritten',
			subtitle: 'hit ↵ to go home',
			valid: true,
			autocomplete: '',
			arg: JSON.stringify({
				alfredworkflow: {
					variables: {
						action: 'change-theme-icons'
					},
					arg: await copyFiles()
				}
			}),
			icon: {
				path: './icons/warning.png'
			}
		}]
	}
}

module.exports.meta = {
	name: '!theme',
	usage: '!toogle to another theme',
	help: '!choose dark or night theme',
	autocomplete: '!theme ',
	icon: {path: './icons/night_and_day.png'}
}

module.exports.match = input => {
	return input.indexOf('!theme') === 0
}
