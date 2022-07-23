const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const annualLeave = require("../annual_leave")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_leave')
        .setDescription('Check medic leave during date')
        .addStringOption(option =>
            option.setName('date').setDescription('Example: 26/07/2022 (dd/mm/yyyy)').setRequired(true)),
    async execute(interaction, client) {
        try {

            var desc = '\n'
            const date = interaction.options.getString('date');
            let medicsLeaveOfToDay = await annualLeave.checkUserLeavesDuringDate(date)

            medicsLeaveOfToDay.sort((a, b) => {
                let fa = a[5].toLowerCase(),
                    fb = b[5].toLowerCase();
                if (fa < fb) {
                    return -1;
                }
                if (fa > fb) {
                    return 1;
                }
                return 0;
            })

            for (let i = 0; i < medicsLeaveOfToDay.length; i++) {
                if (i > 0 && medicsLeaveOfToDay[i][5] != medicsLeaveOfToDay[i - 1][5]) {
                    desc += '---------------------------\n'
                }
                let typeOfLeave = ''
                if (medicsLeaveOfToDay[i][2] === 'ลาพักร้อน') {
                    typeOfLeave = '[ลาพักร้อน]'
                }
                desc += `เวร ${medicsLeaveOfToDay[i][5]}: ${medicsLeaveOfToDay[i][1]} ${typeOfLeave}\n`
            }

            let embed = new MessageEmbed()
                .setColor('#fff111')
                .addField(`ลาวันที่: ${date}`, '----------------------')
                .addField(`รายชื่อแพทย์`, ` ${desc}\n`)
                .setTimestamp()
                .setFooter({ text: 'วันที่ ' });

            interaction.guild.channels.cache.get(interaction.channelId)
                .send({ embeds: [embed] }).catch(console.error);

            interaction.reply({ content: "Success" }).then(() => {
                interaction.deleteReply()
            })

        } catch (error) {
            console.log(error)
        }
    },
};