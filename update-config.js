const alfy = require('alfy')

const {modelExist} = require('./src/anki/anki-models')

const modelFieldNames = require(`${process.env.alfred_workflow_data}/anki-model-fields.json`)
const {env} = process

const toggle = (field, fields) => {
	switch (fields[field]) {
		case 'not_rli': fields[field] = 'rli'
			break
		default: fields[field] = 'not_rli'
			break
	}
}

const updateFieldsConfig = async newFields => {
	const fields = alfy.config.get('fields')
	for (const field of newFields) {
		const modelId = alfy.config.get('default-model') ? alfy.config.get('default-model')[Object.keys(alfy.config.get('default-model'))[0]] : null
		if (fields[modelId] === undefined) {
			fields[modelId] = {}
		}

		if (fields[modelId][field] === undefined) {
			fields[modelId][field] = 'not_rli'
		}

		if (env[field] === field) {
			toggle(field, fields[modelId])
		}
	}

	alfy.config.set('fields', fields)
}

if (alfy.config.get('fields') === undefined) {
	alfy.config.set('fields', {})
}

if (env.config_variable_deck) {
	alfy.config.set(env.config_variable_deck, env.config_value)
}

if (env.config_variable_profile) {
	alfy.config.set(env.config_variable_profile, env.config_value)
	alfy.cache.set('new-profile', true)
	alfy.cache.set('refresh-done', false)
}

if (env.config_variable_model) {
	(async () => {
		alfy.config.set(env.config_variable_model, JSON.parse(env.config_value))
		alfy.cache.set('new-profile', false)
		const newFields = await modelExist(Object.keys(alfy.config.get('default-model'))[0])
		await updateFieldsConfig(newFields)
	})()
} else {
	updateFieldsConfig(modelFieldNames)
}

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

if (env.mode === 'getProfileName') {
	process.stdout.write(alfy.config.get('default-profile'))
}
