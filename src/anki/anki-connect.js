const {XMLHttpRequest} = require('xmlhttprequest')
const Promise = require('promise')

const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')

module.exports = function (action, version, params) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.addEventListener('error', () =>
			reject(new WorkflowError(errorAction('main').title, errorAction('main')))
		)
		xhr.addEventListener('load', () => {
			try {
				const response = JSON.parse(xhr.responseText)
				if (response.error) {
					throw response.error
				}

				if (Object.prototype.hasOwnProperty.call(response, 'result')) {
					resolve(response.result)
				}

				reject(new Error('failed to get results from AnkiConnect'))
			} catch (error) {
				reject(error)
			}
		})

		xhr.open('POST', 'http://127.0.0.1:8765')
		xhr.send(
			JSON.stringify({
				action,
				version,
				params
			})
		)
	})
}
