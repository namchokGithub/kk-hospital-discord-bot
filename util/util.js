const { MessageEmbed } = require('discord.js');

const announcement = async function(nameAuthor, title, titleDes, footer, interaction) {
    const exampleEmbed = new MessageEmbed()
        .setColor('#fff111')
        .setTitle(title)
        .setDescription(titleDes)
        .setAuthor({ name: nameAuthor, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: '' })
        .setTimestamp()
        .setFooter({ text: footer });

    interaction.channel.send({ embeds: [exampleEmbed] });
};

const getAvatarURL = (userID, client) => {
    myUser = client.users.cache.get(userID)
    return myUser.avatarURL()
}

const getUserByID = (userID, client) => {
    myUser = client.users.cache.get(userID)
    return myUser
}

module.exports = { announcement, getAvatarURL, getUserByID };