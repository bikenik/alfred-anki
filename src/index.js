/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-parserOptions: {"ecmaVersion: 2017"} */

'use strict'
const fs = require('fs')
const jsonfile = require('jsonfile')
const pMap = require('p-map')
const {markdownIt} = require('./utils/engine')
const ankiAddCard = require('./anki/anki-add-card')
const config = require('./config')
const modelFieldNames = require('./input/anki-model-fields.json')

const header = jsonfile.readFileSync(config.input)

let firstField = [Object.keys(header)[0]]
if (firstField[0] === undefined) {
	firstField = modelFieldNames[0]
	header[firstField] = ''
}

async function main() {
	setupDirStructure()
	const cleanedInput = cleanInput(header)
	const output = await processInput(cleanedInput)
	await ankiAddCard(output)
}

function setupDirStructure() {
	fs.existsSync(config.mediaDir)
}

function cleanInput(input) {
	const deUndefinedArray = [input].filter(card => {
		return card[firstField] !== undefined
	})
	const deDupedArray = removeDuplicates(deUndefinedArray, config.fields[firstField])
	return deDupedArray
}

async function processInput(input) {
	const mapper = async card => {
		const data = await getData(card)
		const modifiedCard = card
		Object.assign(modifiedCard, data)
		return modifiedCard
	}

	const result = await pMap(input, mapper, {
		concurrency: config.concurrency
	})
	return result
}

async function getData(card) {
	markdownIt(card)
	const result = {}
	for (const field of modelFieldNames) {
		result[field] = card[field] ? card[field] : ''
	}

	result.Tag = card.Tag ? card.Tag : ''
	return result
}

function removeDuplicates(myArr, prop) {
	return myArr.filter((obj, pos, arr) => {
		return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
	})
}

main()
