require('dotenv').config()

const getHello = async (req, res) => {
    var discordEnabled = false
    if (
        process.env.DISCORD_ID 
        && process.env.DISCORD_SECRET
        && process.env.DISCORD_URL
        && process.env.DISCORD_AUTH_URL
    ) {
        discordEnabled = true
    }

    var usernameEnabled = false
    if (process.env.USERNAME_ACCOUNTS === "true") {
        usernameEnabled = true
    }

    const helloJSON = {
        google: false,
        discord: discordEnabled,
        username: usernameEnabled
    }

    res.status(200).json({
        success: true,
        message: "hii! :3",
        data: helloJSON
    })
    return
};

module.exports = { getHello }