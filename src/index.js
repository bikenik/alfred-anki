/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-unused-vars */
/* eslint-parserOptions: {"ecmaVersion: 2017"} */

'use strict'
const fs = require('fs')
const jsonfile = require('jsonfile')
const pMap = require('p-map')
const ankiAddCard = require('./anki/anki-add-card')
const config = require('./config')
const modelFieldNames = require('./input/anki-model-fields.json')
const header = require('./input/header.json')

async function main() {
	setupDirStructure()
	const inputCollection = jsonfile.readFileSync(config.input)
	const cleanedInput = cleanInput(inputCollection)
	const output = await processInput(cleanedInput)
	await ankiAddCard(output)
}

function setupDirStructure() {
	fs.existsSync(config.mediaDir)
}

function cleanInput(input) {
	const deUndefinedArray = input.filter(card => {
		return card.Front !== undefined
	})
	const deDupedArray = removeDuplicates(deUndefinedArray, config.fields.front)
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
	const headerEdited = header[0]
	for (const key in headerEdited) {
		if (key !== 'Video') {
			let element = headerEdited[key]
			const mdImg = /!\[(.*?)\]\(((http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|svg)).*?\)/gm
			const mdLink = /(\s|^)\[(.*?)\]\(((http.*?\/\/|www)(.*?\....\/).*?)\)/gm
			element = element.replace(mdLink, ' <a href="$3">$2</a>')
			element = element.replace(mdImg, ' <img src="$2" alt="$1" />')
			headerEdited[key] = element
		}
	}

	const result = {}
	for (const field of modelFieldNames) {
		result[field] = headerEdited[field] ? headerEdited[field] : ''
	}

	result.Tag = headerEdited.Tag ? headerEdited.Tag : ''
	return result
}

function removeDuplicates(myArr, prop) {
	return myArr.filter((obj, pos, arr) => {
		return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
	})
}

main()
