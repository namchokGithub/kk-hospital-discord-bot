const { MessageEmbed } = require('discord.js');
const annualLeave = require("../annual_leave")
const configDiscord = require("../config/config-discord.json");
const funcUtil = require("./other");

module.exports = {
    async cronCheckDutyLeave(client) {
        try {
            var dateNow = new Date()
            var desc = '\n----------------------\n'
            const duty = funcUtil.getDutyWithHour(dateNow.getHours().toLocaleString())
            const date = funcUtil.changeDateFormat(dateNow.toLocaleDateString())

            let medicsLeaveOfToDay = await annualLeave.checkUserDutyLeavesDuringDate(date, duty)
            let newFormatDate = funcUtil.changeDateFormat01(date)
            medicsLeaveOfToDay.sort((a, b) => {
                let fa = a[1].toLowerCase(),
                    fb = b[1].toLowerCase();
                if (fa < fb) {
                    return -1;
                }
                if (fa > fb) {
                    return 1;
                }
                return 0;
            })

            if (medicsLeaveOfToDay.length == 0) {
                desc += "ไม่พบแพทย์ลาเวร"
            } else {
                for (let i = 0; i < medicsLeaveOfToDay.length; i++) {
                    let typeOfLeave = ''
                    if (medicsLeaveOfToDay[i][2] === 'ลาพักร้อน') {
                        typeOfLeave = '[ลาพักร้อน]'
                    }
                    if (medicsLeaveOfToDay[i][5] == duty) {
                        desc += `${medicsLeaveOfToDay[i][1]} ${typeOfLeave}\n`
                    }
                }
            }

            let embed = new MessageEmbed()
                .setColor('#fff111')
                .addField(`เวร ${duty}`, `\n ------------`)
                .addField('รายชื่อแพทย์ที่ลา', `${desc}\n`)
                .setURL(`https://calendar.google.com/calendar/u/0/r/day/${newFormatDate}`)
                .setTimestamp()
                .setFooter({ text: 'วันที่ ' });

            client.channels.cache.get(configDiscord.channelForCronUpdateLeave).send({ embeds: [embed] }).catch(console.error);

        } catch (error) {
            console.log(error)
        }
    }
};