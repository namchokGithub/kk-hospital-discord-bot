const { Client, Intents, MessageEmbed, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const path = require('node:path');
const nodeCron = require("node-cron");
const config = require("./config/config.json");
const tokenID = require("./config/token.json");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

// Utils
const annualLeave = require("./annual_leave")
const { getUserByID } = require("./util/util.js");
const { cronCheckDutyLeave } = require('./util/cron_check_duty_leave');

// Set command
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(tokenID.token);
(async() => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Cronjob
const job1 = nodeCron.schedule("1 0 0-23/3 * * *", () => {
    console.log("3 hrs: " + new Date().toLocaleString());

});

const job2 = nodeCron.schedule("*/30 * * * * *", () => {
    cronCheckDutyLeave(client)
});

//Set listener on 'ready'
client.on('ready', async() => {
    console.log('Medic-BOT', client.user.presence.status);
    client.user.setActivity("you", { type: 'WATCHING' });
    client.user.setPresence({
        status: "online"
    });

    job1.start();
    job2.start();
});

// ----- Temporary -----

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// client.on('interactionCreate', async(interaction) => {
//     if (!interaction.isCommand()) return;

//     let mheeNam = config['member-list']['mhee-name']
//     let mheeNamTag = config['member-list']['mhee-name-tag']
//     let user = getUserByID(mheeNam, client)
//     const { commandName } = interaction;

//     if (commandName === 'p') {
//         let embed = new MessageEmbed()
//             .setColor('#fff111')
//             .setTitle('ระเบียบการลง "เข้า-ออกเวร"  ⏰')
//             .setAuthor({ name: 'KK Hospital: ประกาศจากโรงพยาบาล', iconURL: 'https://i.imgur.com/aYwvIQr.png', url: '' })
//             .setDescription(`
//             - แพทย์ต้องกรอกข้อมูลการ เข้า-ออก เวรใน Google form ทุกครั้งหลังจากออกเวร
//                เพื่อเป็นการบันทึกว่าแพทย์มีการเข้าเวรและปฎิบัติงานตามกำหนด
//             - ให้กรอกเป็นเวลา 00.00 น. - 23.59 น. หรือ 12:00 AM - 11.59 PM
//             - ห้องเอกสาร เข้า-ออกเวร 

//             หมายเหตุ 1 :
//             - ไม่อนุญาติให้กรอกข้อมูลข้ามวัน 
//             - สามารถกรอกข้อมูลย้อนหลังได้สูงสุด ไม่เกิน 2 วัน หากเกินกว่านั้นข้อมูลจะไม่ถูกนับรวมไปในชั่วโมงการเข้าเวร แต่จะนับวันที่เข้าเวรให้
//             - ทุกการลงเข้า-ออกเวรจะมีการตรวจสอบจากในเมืองและ Discord
//             - แพทย์ที่ปฏิบัติงาน OT และลงชื่อตรงเวลาจะมีโบนัสประจำสัปดาห์
//             - เช็คชื่อเข้า-ออกเวร [https://docs.google.com/spreadsheets/d/19twyD_NVmH6AnEKEbhpMyTWi_DcVZCL0aswrfTrxhYU/edit]

//             หมายเหตุ 2 : หากมีการกรอกข้อมูลผิดพลาดให้ติดต่อแพทย์ทรงคุณวุฒิหรือหัวหน้าแพทย์ หรือ
//             ⸻⸻⸻⸻
//             ลงชื่อ ${mheeNamTag} 
//             `)
//             .setTimestamp()
//             .setFooter({ text: 'ประกาศวันที่ ', iconURL: user.avatarURL() });

//         client.channels.cache.get('886908944516268062').send({ embeds: [embed] })
//         await interaction.reply("Success")
//         await interaction.deleteReply();
//     } else
//     if (commandName === 'server') {
//         await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
//     }
// });

client.on('message', async(message) => {
    if (message.author.bot) return;

    if (message.content === 'Hi') {
        message.reply('ยินดีต้อนรับ');
    } else if (message.content === 'check') {
        let medicsLeaveOfToDay = await annualLeave.checkUserLeavesToday()
        console.log(medicsLeaveOfToDay)
        for (let i = 0; i < medicsLeaveOfToDay.length; i++) {
            message.reply(` \`\`\` 
            Name: ${medicsLeaveOfToDay[i][1]} (${medicsLeaveOfToDay[i][2]})
            Reason: ${medicsLeaveOfToDay[i][6]}
            Duty: ${medicsLeaveOfToDay[i][5]} 
                            \`\`\` `)
        }

    }
});

// Announcement
client.on("message", (message) => {
    return;
    if (message.member == null) return;
    if (!message.member.roles.cache.has(config['announcer-role']) || !message.content.startsWith("!") || message.author.bot) return;

    const args = message.content.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command == "announce") {
        var announcement = "";
        for (const word in args) {
            announcement = announcement + args[word] + " ";
        }

        const exampleEmbed = new MessageEmbed()
            .setColor('#fff111')
            .setTitle('Some title')
            .setURL('')
            .setAuthor({ name: 'KK Hospital', iconURL: 'https://i.imgur.com/aYwvIQr.png', url: '' })
            .setDescription('Some description here')
            .setThumbnail('https://i.imgur.com/aYwvIQr.png')
            .addFields({ name: 'Regular field title', value: 'Some value here' }, { name: '\u200B', value: '\u200B' }, { name: 'Inline field title', value: 'Some value here', inline: true }, { name: 'Inline field title', value: 'Some value here', inline: true }, )
            .addField('Inline field title', 'Some value here', true)
            // .setImage('https://i.imgur.com/AfFp7pu.png')
            .setTimestamp()
            .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        message.channel.send({ embeds: [exampleEmbed] });
    } else {
        console.log("Not correct command")
    }
})

client.login(tokenID.token);