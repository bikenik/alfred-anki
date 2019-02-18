/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable guard-for-in */
/* eslint-env es6 */

const alfy = require('alfy')
const jsonfile = require('jsonfile')
const headerJson = require('../input/header.json')

const fileHeader = './src/input/header.json'
const currentConfig = alfy.config.get('fields')

const resetHeader = header => {
	jsonfile.writeFile(fileHeader, header, {
		spaces: 2
	}, error => {
		if (error !== null) {
			console.error(error)
		}
	})
}

if (process.env.action === 'reset-for-next-card') {
	const header = {}

	for (const key2 in currentConfig) {
		for (const key in headerJson[0]) {
			if (key === key2 && currentConfig[key2] === 'rli') {
				header[key] = headerJson[0][key]
			}

			if (key === key2 && currentConfig[key2] === 'not_rli') {
				header[key] = ''
			}
		}
	}

	resetHeader([header])
} else if (process.env.action === 'reset') {
	resetHeader([{}])
} else if (process.argv[2]) {
	const header = headerJson ? headerJson : [{}]
	const currentData = JSON.parse(process.argv[2])

	const currentProperty = Object.keys(currentData)[0]
	console.log('log‼️', currentData[currentProperty])
	header[0][currentProperty] = currentData[currentProperty]
	jsonfile.writeFile(fileHeader, header, {
		spaces: 2
	}, error => {
		if (error !== null) {
			console.error(error)
		}
	})
}

module.exports = {resetHeader}
