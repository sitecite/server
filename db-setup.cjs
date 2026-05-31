const mysql = require("mysql2/promise")
const exec_mysql = require("./gen_functions/exec_mysql.js")
const { styleText } = require('node:util');
const { exit } = require("node:process");
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    // database: process.env.MYSQL_DATABASE,
    // connectionLimit: 10,

    connectTimeout: 20000,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
})

console.log("\n" + styleText("bgBlue", "Setting up database...") + "\n")
async function main() {
    con = await pool.getConnection()

    if (!con) {
        console.error(styleText("red", "Could not establish a connection with the pool: "), err)
        throw new Error('Failed to get connection from pool');
    }

    await exec_mysql.executeQuery(con,
        `CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE};`, [])

    await exec_mysql.executeQuery(con,
        `USE ${process.env.MYSQL_DATABASE};`, [])

    await exec_mysql.executeQuery(con, `
		CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT UNIQUE,
			username VARCHAR(64) UNIQUE,
			password VARCHAR(128),
            connection_type INT,
            discord_id VARCHAR(64) UNIQUE,
            google_id VARCHAR(64) UNIQUE,
            creation_date BIGINT NOT NULL,

			PRIMARY KEY(id)
		);`)

    await exec_mysql.executeQuery(con,
        `CREATE TABLE IF NOT EXISTS user_customisation (
			user_id INT,
            bg_color VARCHAR(8),
            color VARCHAR(8),
            font VARCHAR(64),
			
            PRIMARY KEY(user_id)
		)`
    )

    await exec_mysql.executeQuery(con,
        `CREATE TABLE IF NOT EXISTS user_web_tokens (
			user_id INT NOT NULL,
            token VARCHAR(64) NOT NULL,
            expire BIGINT NOT NULL,
			
            UNIQUE KEY uk_ids (user_id, token)
		)`
    )

    await exec_mysql.executeQuery(con,
        `CREATE TABLE IF NOT EXISTS user_ext_tokens (
			user_id INT NOT NULL PRIMARY KEY,
            token VARCHAR(64) NOT NULL,
            expire BIGINT NOT NULL
		)`
    )
    
    await exec_mysql.executeQuery(con,
        `CREATE TABLE IF NOT EXISTS links (
			user_id INT NOT NULL,
            code VARCHAR(8) NOT NULL,
            text VARCHAR(1028) NOT NULL,
            link VARCHAR(512) NOT NULL,
            creation_date BIGINT NOT NULL,
			
            PRIMARY KEY(code)
		)`
    )
    await con.release()
    await pool.end()

    console.log("\n" + styleText("bgGreen", "Database set up!") + "\n")

}

main()

// return