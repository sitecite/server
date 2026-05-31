const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const fetch = require("node-fetch");
const mysql = require("mysql2/promise");
const { styleText } = require('node:util');
const fs = require('fs');
const { URL } = require('url');
const { type } = require('os');
const refresh = require("./gen_functions/refresh")

const app = express();
const http = require('http').createServer(app);


require('dotenv').config()

// app.enable('trust proxy')

// create new mysql pool for connections
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    // connectionLimit: 10,
    connectTimeout: 20000,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
})

module.exports = pool
console.log(styleText("green", `Connected to MySQL database at ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT} as ${process.env.MYSQL_USER}`))

// // handle errors
// process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
//     // check if logging to file is enabled
//     if (process.env.LOG == 1) {
//         var stream = fs.createWriteStream(process.env.LOG_FILE, { flags: 'a' });
//         stream.write(`[${new Date().toUTCString()}] ${error} \n`)
//         stream.end();
//     }
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (error) => {
//     console.error('Unhandled Rejection:', error);
//     // Log to file or error tracking service here
//     if (process.env.LOGS == 1) {
//         var stream = fs.createWriteStream(process.env.LOG_FILE, { flags: 'a' });
//         stream.write(`[${new Date().toUTCString()}] ${error} \n`)
//         stream.end();
//     }
// });

app.use(cookieParser(process.env.COOKIE_SECRET));

// public directory
app.use(express.static(__dirname + '/public', { extensions: ['html'] }));
app.use(express.json()); // Parse JSON request bodies

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// fonts
app.use('/fonts', function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    next()
});
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use(express.json()); // Parse JSON request bodies

const limiter = rateLimit({
    windowMs: 6000,
    limit: 10,
    handler: (req, res) => {
        res.status(429).json({ success: false, message: "You have been rate limited" });
        console.warn("User got ratelimited.")
        return
        // throw new Error("You have been rate limited!")
    },
    legacyHeaders: false,
    standardHeaders: true,
});

// Defining limits for each endpoint
app.use(limiter)
// app.use("/account", limiter)

//* Directory routers
const accountManager= require('./account/router.js');
app.use('/account/', accountManager);

const apiManager = require('./api/router.js');
app.use('/api/', apiManager);

const linkManager = require('./link/router.js');
app.use('/l/', linkManager);


//* Middleware 

// 404 page
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + "/public/404.html")
});

// Error handling
const errorHandler = require('./errorHandler');
app.use(errorHandler);

// if program exits, run this
// its nicer if i actually properly close connection
process.on("exit", function () {
    pool.end((err) => {
        if (err) console.error('Error closing pool:', err)
        })
    console.log("Connection to database closed")
    console.log("\n" + styleText("bgRed", "Webserver terminated") + "\n")
});

// catching signals and do something before exit
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function (sig) {
    process.on(sig, function () {
        terminator(sig);
        console.log('signal: ' + sig);
    });
});

function terminator(sig) {
    if (typeof sig === "string") {
        // if any async functions need to be done, they can be done here
        // if not, call clean exit
        console.log('\n' + styleText('red', `Received ${sig} - terminating webserver`) + "\n");
        process.exit(1);
    }
}

http.listen(9404, () => {
    console.log("\n"+ styleText("bgGreen", "Server is listening on port 9404"));
});


async function refreshSimple() {
    await pool
    refresh.tokenRefresh(pool)
}
// run once at server start; otherwise it takes 15 mins and thats boring
refreshSimple()
// Run the refresh code every 15 mins (delete old tokens; cleans up database)
setInterval(async function () {
    refreshSimple()
}, 60_000 * 15)
// repeat every 15 minutes
