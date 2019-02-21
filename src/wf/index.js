const fs = require('fs')
const Handlebars = require('handlebars')
const Entities = require('html-entities').AllHtmlEntities
const alfy = require('alfy')
const jsonfile = require('jsonfile')
const ankiInfo = require('../anki/anki-info')
const {Render} = require('../utils/engine')
const {markdownIt} = require('../utils/engine')
const header = require('../input/header.json')
const modelFieldNames = require('../input/anki-model-fields.json')

const entities = new Entities()

const inFile = './src/input/preview/preview.hbs'
const outFile = './src/input/preview/preview.html'
const source = fs.readFileSync(inFile, 'utf8')
const currentValueOfHeader = jsonfile.readFileSync('./src/input/header.json')

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
				subtitle: '🎉 \t   Add New Card \t🎉',
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
			currentText: header[field] ? header[field] : ''
		}
	}

	for (const field of modelFieldNames) {
		const item = new Render(field,
			'title', 'quicklookurl', 'variables', 'subtitle', 'arg', 'icon', 'mods')
		item.title = header[field] ? header[field] : '...'
		item.subtitle = field
		item.arg = ''
		item.quicklookurl = `${process.env.PWD}/src/input/preview/preview.html`
		item.icon = alfy.config.get('fields')[field] === 'rli' ? fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}_marked.png` : './icons/flag_marked.png' : fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}.png` : './icons/flag.png'
		item.variables = variables(field)
		item.mods = mods(field)
		items.push(item.getProperties())
	}

	const tags = new Render('Tags',
		'title', 'variables', 'quicklookurl', 'subtitle', 'arg', 'icon', 'mods')
	tags.title = header.Tag ? header.Tag : '...'
	tags.subtitle = 'Choose your tags'
	tags.arg = ''
	tags.quicklookurl = `${process.env.PWD}/src/input/preview/preview.html`
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

const template = Handlebars.compile(source)

let toRender = ''
if (currentValueOfHeader) {
	markdownIt(currentValueOfHeader)
}

for (const fieldName of modelFieldNames) {
	toRender += `
		<tr>
			<th scope="row">${fieldName}</th>
			<td>${currentValueOfHeader[fieldName] ? currentValueOfHeader[fieldName] : '...'}</td>
		<tr>
		`
}

const result = template({FIELD: toRender})
fs.writeFileSync(outFile, entities.decode(result))
