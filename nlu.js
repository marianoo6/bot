const TelegrafWit = require('telegraf-wit')
const Promise = require('bluebird')

const wit = new TelegrafWit('P4I7QNXY76XKKPH6WVYJR5PGFDRXD3CF')

module.exports = (message) => {
	return new Promise((resolve, reject) => {
		wit.meaning(message.text).then(result => {
			message.nlu = result
			resolve(message)
		})

	})
}