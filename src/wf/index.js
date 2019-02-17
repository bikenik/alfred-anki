/* eslint-disable camelcase */
const fs = require('fs')
const alfy = require('alfy')
const ankiInfo = require('../anki/anki-info')
const {Render} = require('../utils/engine')
const header = require('../input/header.json')
const modelFieldNames = require('../input/anki-model-fields.json')

const handleFields = async () => {
	const items = []
	const subtitle = 'toggle the option: remember last input'

	const mods = field => {
		const checkEmtyField_1 = header[0].Front && header[0].Front.length > 0
		const checkEmtyField_2 = header[0].Back && header[0].Back.length > 0
		return {
			ctrl: {
				subtitle,
				variables: {[field]: field}
			},
			cmd: {
				valid: true,
				subtitle: '🎉 \t   Add New Card \t🎉',
				variables: {
					action: checkEmtyField_1 && checkEmtyField_2 ? 'make-new-card' : false
				}
			}
		}
	}

	const variables = field => {
		return {
			mode: field,
			action: 'work',
			currentText: header[0][field] ? header[0][field] : ''
		}
	}

	for (const field of modelFieldNames) {
		const item = new Render(field,
			'title', 'variables', 'subtitle', 'arg', 'icon', 'mods')
		item.title = header[0][field] ? header[0][field] : '...'
		item.subtitle = field
		item.arg = ''
		item.icon = alfy.config.get('fields')[field] === 'rli' ? fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}_marked.png` : './icons/flag_marked.png' : fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}.png` : './icons/flag.png'
		item.variables = variables(field)
		item.mods = mods(field)
		items.push(item.getProperties())
	}

	const tags = new Render('Tags',
		'title', 'variables', 'subtitle', 'arg', 'icon', 'mods')
	tags.title = header[0].Tag ? header[0].Tag : '...'
	tags.subtitle = 'Choose your tags'
	tags.arg = ''
	tags.icon = alfy.config.get('Tag') === 'rli' ? './icons/tag_marked.png' : './icons/tag.png'
	tags.variables = {
		mode: 'Tags',
		action: 'work'
	}
	tags.mods = mods('Tag')
	items.push(tags.getProperties())
	return items
}

module.exports.fields = async () => {
	const ankiInfoRes = await ankiInfo()
	const fields = await handleFields()
	fields.unshift(ankiInfoRes[0] ? ankiInfoRes[0] : ankiInfoRes)
	const result = alfy.inputMatches(fields, 'subtitle')
	return result
}
