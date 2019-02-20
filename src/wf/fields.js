/* eslint no-extend-native: ["error", { "exceptions": ["String"] }] */
const fs = require('fs')
const alfy = require('alfy')
const {getTags} = require('../anki/anki-tags')
const {Render} = require('../utils/engine')
const modelFieldNames = require('../input/anki-model-fields.json')

/* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
String.prototype.replaceAll = function (search, replacement) {
	const target = this
	return target.replace(new RegExp(search, 'gi'), replacement)
}

for (const field of modelFieldNames) {
	if (process.env.mode === field) {
		const input = alfy.input.replace(/\\n(\s|)/g, '\n')
		alfy.output([{
			title: input,
			subtitle: `✏️ ${field}: ...`,
			icon: {path: fs.existsSync(`./icons/${field}.png`) ? `./icons/${field}.png` : './icons/Flag.png'},
			arg: JSON.stringify({[field]: input})
		}])
	}
}

if (process.env.mode === 'Tags') {
	const showTags = async () => {
		const tags = await getTags()
		tags.unshift('')
		const items = []
		for (const tag of tags) {
			const item = new Render('tags',
				'title', 'subtitle', 'arg', 'icon')
			item.title = tag
			item.subtitle = 'some subtitle'
			item.arg = JSON.stringify({Tag: tag})
			item.icon = './icons/tag.png'
			items.push(item.getProperties())
		}

		if (alfy.inputMatches(items, 'title').length > 0) {
			alfy.output(alfy.inputMatches(items, 'title'))
		} else {
			const tag = alfy.input.replaceAll(/\s/, '_').replaceAll(/,/, ' ').replaceAll(/\s_/, ' ')
			alfy.output([{
				title: `Add - [${tag}] - as your new tag`,
				subtitle: 'add <, > for several tags',
				arg: JSON.stringify({Tag: tag})
			}])
		}
	}

	showTags()
}
