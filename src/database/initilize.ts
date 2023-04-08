import mysql from 'mysql2/promise';

export async function Init() {
    const connection: mysql.Connection = await require('./connectionhandler').GetDB();
    await connection.query(`CREATE TABLE IF NOT EXISTS consound (id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS message_log (id VARCHAR(255) NOT NULL, user VARCHAR(255) NOT NULL, content TEXT NOT NULL, channel VARCHAR(255) NOT NULL, time VARCHAR(255) NOT NULL, PRIMARY KEY (id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS linkedAccounts (uuid VARCHAR(36), minecraftName VARCHAR(16), discordId VARCHAR(18), discordName VARCHAR(32))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS linkingCodes (code VARCHAR(6), discordName VARCHAR(32), discordId VARCHAR(18))`);
    console.log('Initialized database!');
}