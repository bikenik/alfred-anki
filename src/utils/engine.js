/* eslint max-params: ["error", 9] */
'use strict'
const hljs = require('highlight.js')
const md = require('markdown-it')({
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return '<pre class="hljs"><code>' +
					hljs.highlight(lang, str, true).value +
					'</code></pre>'
			} catch (error) {
				console.log(error)
			}
		}

		return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
	}
}).use(require('markdown-it-mark')).use(require('markdown-it-ins'))

const clearSentences = argSentence => argSentence.replace(/\s(\.|\?|!)/g, '$1')
const largetypeFunc = (title, subtitle) => {
	return `${title ? title : ''}\n\n${subtitle ? subtitle : ''}`
}

const clearSentencesInArg = arg => {
	if (arg && arg.examples) {
		for (const example of arg.examples) {
			if (example.text) {
				example.text = clearSentences(example.text)
			}
		}
	}
}

const keyOperations = (item, key) => {
	switch (key) {
		case 'title':
			item.autocomplete = item.title
			break
		case 'icon':
			item.icon = {path: item.icon}
			break
		case 'arg':
			clearSentencesInArg(item.arg)
			break

		default:
			break
	}
}

module.exports.Render = class {
	constructor(name, ...itemKeys) {
		const item = {}
		item.name = name
		item.valid = true
		item.sentence = ''
		item.mods = {
			ctrl: {
				valid: false
			}
		}
		for (const key of itemKeys) {
			this.itemKey = null
			Object.defineProperty(this, key, {
				get: () => key,
				set: value => {
					item[key] = value
					keyOperations(item, key)
					if (key === 'title') {
						item.autocomplete = item.title
					}

					if (Object.keys(item).length - 3 === itemKeys.length) {
						clearSentencesInArg(item.arg)
						if (!item.text) {
							const largetype = largetypeFunc(item.title, item.subtitle)
							item.text = {
								copy: largetype,
								largetype
							}
						}
					}
				}
			})
		}

		this.getProperties = () => item
	}
}

module.exports.markdownIt = arr => {
	for (const key in arr) {
		if (key !== 'Tag') {
			let element = md.render(arr[key])
			const clozeDeletion = /\[\[(.*?)\]\]/gm
			element = element.replace(clozeDeletion, '{{c1::$1}}')
			arr[key] = element
		}
	}
}
