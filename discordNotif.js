import 'dotenv/config';
import { Webhook, MessageBuilder } from 'discord-webhook-node';
import fs from 'fs';

const hook = new Webhook(process.env.DISCORD_WEBHOOK)

fs.readFile('mochawesome-report/mochawesome.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading mochawesome.json file:", err);
    }
    const reportData = JSON.parse(data)
    sendDiscordNotification(reportData)
})

function sendDiscordNotification(reportData) {
    var color = reportData.stats.failures === 0 ? '#00ff00' : '#ff0000'
    const embed = new MessageBuilder()
        .setTitle("API TEST REPORT")
        .setDescription("A random description of what this is")
        .addField("Total Tests", reportData.stats.tests,)
        .addField("Passed Tests", reportData.stats.passes)
        .addField("Failed Tests", reportData.stats.failures)
        .addField("Skipped Tests", reportData.stats.skipped)
        .addField("Pass %", `${reportData.stats.passPercent}%`)
        .setColor(color)

    hook.send(embed)
}