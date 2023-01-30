import mysql from 'mysql2/promise';

let connection: mysql.Connection;
let config = require('../config.json');

export async function Connect() {
    connection = await mysql.createConnection(config.mysql);
    console.log('Connected to database!');
}

export async function GetDB() {
    const connected = await checkConnection();
    if (!connected || !connection) {
        await Connect();
    }
    return connection;
}

async function checkConnection() {
    if (!connection) return false;
    return (await connection.query("SELECT 1").then(() => true, () => false));
}
