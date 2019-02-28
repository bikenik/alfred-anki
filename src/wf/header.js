/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable guard-for-in */
/* eslint-env es6 */

const alfy = require('alfy')
const jsonfile = require('jsonfile')
const headerJson = require('../input/header.json')

const fileHeader = './src/input/header.json'
const modelId = alfy.config.get('default-model') ? alfy.config.get('default-model')[Object.keys(alfy.config.get('default-model'))[0]] : null
const currentConfig = alfy.config.get('fields') ? alfy.config.get('fields')[modelId] : null

const resetHeader = header => {
	jsonfile.writeFile(fileHeader, header, {
		spaces: 2
	}, error => {
		if (error !== null) {
			console.error(error)
		}
	})
}

if (process.env.action === 'reset-for-next-card' && modelId) {
	const header = {}

	for (const key2 in currentConfig) {
		for (const key in headerJson[modelId]) {
			if (key === key2 && currentConfig[key2] === 'rli') {
				header[key] = headerJson[modelId][key]
			}

			if (key === key2 && currentConfig[key2] === 'not_rli') {
				header[key] = ''
			}
		}
	}

	if (alfy.config.get('Tag') === 'rli') {
		header.Tag = headerJson.Tag
	} else if (alfy.config.get('Tag') === 'not_rli') {
		header.Tag = ''
	}

	headerJson[modelId] = header
} else if (process.env.action === 'reset') {
	headerJson[modelId] = {}
	resetHeader(headerJson)
} else if (process.argv[2]) {
	const header = headerJson ? headerJson : {[modelId]: {}}
	const currentData = JSON.parse(process.argv[2])

	const currentProperty = Object.keys(currentData)[0]
	if (header[modelId]) {
		header[modelId][currentProperty] = currentData[currentProperty]
	} else {
		header[modelId] = {}

		header[modelId][currentProperty] = currentData[currentProperty]
	}

	jsonfile.writeFile(fileHeader, header, {
		spaces: 2
	}, error => {
		if (error !== null) {
			console.error(error)
		}
	})
}
