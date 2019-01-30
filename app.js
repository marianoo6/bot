const Telegraf = require('telegraf')
const express = require('express')
const expressApp = express()
const axios = require('axios')
const nlu = require('./nlu')
const dialog = require('./dialog')
const googleTts = require('google-tts-api')

const bot = new Telegraf("766972717:AAHC-CF8oShhIzWH11cVKDMndlsCskXU4A4")
expressApp.use(bot.webhookCallback('/secret-path'))
bot.telegram.setWebhook('https://57f79d48.ngrok.io/secret-path')

expressApp.get('/', (req, res) => {
	res.send('Hello World!')
})

expressApp.post('/secret-path', (req, res) => {
	res.send('Hablando...')
})

bot.use((ctx, next) => {
	const start = new Date()
	return next(ctx).then(() => {
		const ms = new Date() - start
		console.log('Response time %sms', ms)
	})
})

bot.start((ctx) => ctx.reply('Hola amigo, Soy MarianooBot. ¿Que quieres?. Si no sabes como utilizarme escribe el comando /help.'))
bot.help((ctx) => ctx.reply(`
	¿Necesitas ayuda? utiliza estos comandos que pueden ayudarte:
	- /creator --> Te daré información sobre mis creadores.
	- /weather (tu ciudad) --> Te daré información sobre el tiempo de la ciudad que me indiques. 
	- /whereami (tu dirección) --> Te daré las cordenadas de la dirección que me indiques.

	`))
bot.on('sticker', (ctx) => ctx.reply('👍'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('/creator', (ctx) => ctx.reply('Mi creador es Mariano de Neoland Madrid.'))

bot.command('/weather', (ctx) => {
	let espacio = ctx.message.text.indexOf(' ')
	let ciudad = ctx.message.text.substring((espacio+1), (ctx.message.text).length) 
	console.log(ciudad)
	axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${ciudad},ES&units=metric&appid=d9f2abfbec3ad3c7c4817814069c587e`)
	.then(response => {
		bot.telegram.sendMessage(ctx.from.id, `La temperatura actual en ${ciudad} es de ${response.data.main.temp}°. Las maximas y minimas a lo largo del dias son las siguentes: ${response.data.main.temp_max}°-${response.data.main.temp_min}° y la humedad es del ${response.data.main.humidity}%`)
	})
	.catch(error => {
		console.log(error);
	});

})

bot.command('/whereami', (ctx) => {
	let espacio = ctx.message.text.indexOf(' ')
	let ciudad = ctx.message.text.substring((espacio+1), (ctx.message.text).length) 
	console.log(ciudad)
	axios.get(`https://geocode.xyz/${ciudad}?json=1`)
	.then(response => {
		bot.telegram.sendPhoto(ctx.from.id, `https://maps.googleapis.com/maps/api/staticmap?center=${response.data.latt},${response.data.longt}&zoom=17&size=1200x600&maptype=roadmap&markers=color:red%7Clabel:%7C${response.data.latt},${response.data.longt}&key=AIzaSyD5h7iot54V6U35ggOGvW6MQGE1Zciune4`)
		bot.telegram.sendMessage(ctx.from.id, `La latitud de ${ciudad} es: ${response.data.latt}° y la longitud: ${response.data.longt}°`)
	})
	.catch(error => {
		console.log(error);
	});

})

bot.on('text', (ctx) => {
	nlu(ctx.message)
		.then(dialog)
		.then((value) => {
			// googleTts(value, 'es-CO', 1).then((url) => {
			// 	bot.telegram.sendAudio(ctx.from.id, url)
			// })
			bot.telegram.sendMessage(ctx.from.id, value)
		}) 

})

bot.catch((err) => {
	console.log('Ooops', err)
})

expressApp.listen(3000, () => {
	console.log('Example app listening on port 3000!')
})

