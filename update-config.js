const alfy = require('alfy')

const {modelExist} = require('./src/anki/anki-models')
const modelFieldNames = require('./src/input/anki-model-fields.json')
const {resetHeader} = require('./src/wf/header')

const {env} = process
const fields = alfy.config.get('fields')

if (env.config_variable) {
	alfy.config.set(env.config_variable, env.config_value)
}

if (env.config_variable_model) {
	resetHeader([{}]);
	(async () => {
		alfy.config.set(env.config_variable_model, env.config_value)
		await modelExist(env.config_value)
		alfy.config.set('fields', {})
	})()
}

const toggle = (field, fields) => {
	switch (fields[field]) {
		case 'not_rli': fields[field] = 'rli'
			break
		default: fields[field] = 'not_rli'
			break
	}
}

for (const field of modelFieldNames) {
	if (fields[field] === undefined) {
		fields[field] = 'not_rli'
	}

	if (env[field] === field) {
		toggle(field, fields)
	}
}

alfy.config.set('fields', fields)
if (alfy.config.get('Tag') === undefined) {
	alfy.config.set('Tag', 'not_rli')
}

if (env.Tag === 'Tag') {
	switch (alfy.config.get('Tag')) {
		case 'not_rli': alfy.config.set('Tag', 'rli')
			break
		default: alfy.config.set('Tag', 'not_rli')
			break
	}
}
