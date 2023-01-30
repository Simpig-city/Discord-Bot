import ws from 'ws';
import discord from 'discord.js';

import { GetDB } from '../../database/connectionhandler';

const config = require('../../config.json');
const port = config.websocket.port;
const password = config.websocket.password;

export async function WebSocket(client: discord.Client) {
    const wss = new ws.Server({ port: port });
    console.log('WebSocket Server started on port 3080!');
    wss.on('connection', (ws) => {
        console.log('Client Connected to WebSocket!');
        ws.on('message', (message) => {
            messageHandler(message, client, ws);
        });
    });
}

async function messageHandler(message: any, client: discord.Client, ws: ws) {
    const data = message.toString();
    const json = JSON.parse(data);
    const send_password = json.password;
    if(send_password !== password) return ws.send('{"error": "Invalid Password"}');

}