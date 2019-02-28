'use strict'
const alfy = require('alfy')
const runApplescript = require('run-applescript')
const set = require('./src/cmd/decks')
const del = require('./src/cmd/del')
const refresh = require('./src/cmd/refresh')
const theme = require('./src/cmd/theme')
const models = require('./src/cmd/models')
const profiles = require('./src/cmd/profiles')
const reset = require('./src/cmd/reset')
const ankiInfo = require('./src/anki/anki-info')
const wf = require('./src/wf')
const WorkflowError = require('./src/utils/error')

const commands = [set, models, profiles, del, refresh, theme, reset]
const option = async input => {
	for (const command of commands) {
		if (command.match(input)) {
			return command(input)
		}
	}

	// No matches, show all commands
	if (/!.*/.test(input)) {
		const options = commands.map(command => ({
			title: command.meta.name,
			subtitle: `${command.meta.help} | Usage: ${command.meta.usage}`,
			autocomplete: command.meta.autocomplete,
			text: {
				largetype: `${command.meta.help} | Usage: ${command.meta.usage}`
			},
			icon: command.meta.icon,
			valid: false
		}))
		return alfy.inputMatches(options, 'title')
	}
}

if (!alfy.cache.get('start-PID')) {
	alfy.cache.set('start-PID', process.pid, {maxAge: 30000}) // 30 sec.
}

(async () => {
	if (alfy.config.get('theme') === undefined) {
		alfy.config.set('theme', 'dark')
	}

	try {
		if (alfy.cache.get('start-PID') === process.pid) {
			await runApplescript(`
				tell application "Alfred 3"
					run trigger ¬
						"refresh" in workflow ¬
						"org.bikenik.anki"
				end tell
		`)
		}

		if (/!.*/.test(alfy.input)) {
			const out = await option(alfy.input)
			alfy.output(out)
		} else {
			const out = await wf.fields()
			alfy.output(out)
		}
	} catch (error) {
		if (error.title === 'Working without AnkiConnect') {
			alfy.output([error])
		} else if (error.message) {
			throw new WorkflowError(error.stack)
		} else {
			await ankiInfo()
		}
	}
})()
