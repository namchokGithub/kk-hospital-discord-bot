const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const annualLeave = require("../annual_leave")
const funcUtil = require("../util/other");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_leave_duty')
        .setDescription('Check medic leave during date')
        .addStringOption(option =>
            option.setName('date').setDescription('Example: 26/07/2022 (dd/mm/yyyy)').setRequired(true))
        .addStringOption(option =>
            option.setName('duty').setDescription('Example: 03:00 (00:00-09:00)').setRequired(true)),
    async execute(interaction, client) {
        try {

            var desc = '\n'
            const date = interaction.options.getString('date');
            const duty = interaction.options.getString('duty');
            let medicsLeaveOfToDay = await annualLeave.checkUserLeavesDuringDate(date)
            newFormatDate = funcUtil.changeDateFormat01(date)
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
                let typeOfLeave = ''
                if (medicsLeaveOfToDay[i][2] === 'ลาพักร้อน') {
                    typeOfLeave = '[ลาพักร้อน]'
                }

                if (medicsLeaveOfToDay[i][5] == duty) {
                    desc += `${medicsLeaveOfToDay[i][1]} ${typeOfLeave}\n`
                }
            }

            let embed = new MessageEmbed()
                .setColor('#fff111')
                .addField(`เวร ${duty}`, `\n ----------------------`)
                .addField('รายชื่อแพทย์ที่ลา', `${desc}\n`)
                .setURL(`https://calendar.google.com/calendar/u/0/r/day/${newFormatDate}`)
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