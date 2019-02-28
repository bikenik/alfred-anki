const fs = require('fs')
const Handlebars = require('handlebars')
const Entities = require('html-entities').AllHtmlEntities
const alfy = require('alfy')
const jsonfile = require('jsonfile')
const config = require('../config').card
const {getProfileName} = require('../config')
const ankiInfo = require('../anki/anki-info')
const {Render} = require('../utils/engine')
const {markdownIt} = require('../utils/engine')
const header = require('../input/header.json')
const modelFieldNames = require('../input/anki-model-fields.json')

const entities = new Entities()

const inFile = './src/input/preview/preview.hbs'
const outFile = `${config.mediaDir}_preview.html`
const source = fs.readFileSync(inFile, 'utf8')
const modelId = alfy.config.get('default-model') ? alfy.config.get('default-model')[Object.keys(alfy.config.get('default-model'))[0]] : null

const handleFields = async () => {
	const items = []
	const subtitle = 'toggle the option: remember last input'

	const mods = field => {
		return {
			ctrl: {
				subtitle,
				variables: {[field]: field}
			},
			cmd: {
				valid: true,
				subtitle: '\t   Add New Card \t🎉',
				variables: {
					action: 'make-new-card'
				}
			}
		}
	}

	const variables = field => {
		return {
			mode: field,
			action: 'work',
			currentText: header[modelId] && header[modelId][field] ? header[modelId][field] : ''
		}
	}

	for (const field of modelFieldNames) {
		const item = new Render(field,
			'title', 'quicklookurl', 'variables', 'subtitle', 'arg', 'icon', 'mods')
		item.title = header[modelId] && header[modelId][field] ? header[modelId][field] : '...'
		item.subtitle = field
		item.arg = ''
		item.quicklookurl = `${config.mediaDir}/_preview.html`
		item.icon = alfy.config.get('fields') && alfy.config.get('fields')[modelId][field] === 'rli' ? fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}_marked.png` : './icons/flag_marked.png' : fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}.png` : './icons/flag.png'
		item.variables = variables(field)
		item.mods = mods(field)
		items.push(item.getProperties())
	}

	const tags = new Render('Tags',
		'title', 'variables', 'quicklookurl', 'subtitle', 'arg', 'icon', 'mods')
	tags.title = header[modelId] && header[modelId].Tag ? header[modelId].Tag : '...'
	tags.subtitle = 'Choose your tags'
	tags.arg = ''
	tags.quicklookurl = `${config.mediaDir}/_preview.html`
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
	let result
	await getProfileName()
	const ankiInfoRes = await ankiInfo()
	const fields = await handleFields()
	fields.unshift(ankiInfoRes[0] ? ankiInfoRes[0] : ankiInfoRes)
	if (fields && fields[0] && fields[0].subtitle && fields[0].name === 'intro') {
		result = alfy.inputMatches(fields, 'subtitle')
	} else {
		result = await ankiInfo()
	}

	return result
}

const template = Handlebars.compile(source)

let toRender = ''
const currentValueOfHeader = jsonfile.readFileSync('./src/input/header.json')
if (currentValueOfHeader[modelId]) {
	markdownIt(currentValueOfHeader[modelId])

	for (const fieldName of modelFieldNames) {
		toRender += `
		<tr>
			<th scope="row">${fieldName}</th>
			<td>${currentValueOfHeader[modelId][fieldName] ? currentValueOfHeader[modelId][fieldName] : '...'}</td>
		<tr>
		`
	}
}

const result = template({
	FIELD: toRender
})
try {
	fs.writeFileSync(outFile, entities.decode(result))
} catch (error) {
}
