import ws from 'ws';
import discord from 'discord.js';

import { Connect, GetDB } from '../../database/connectionhandler';

const config = require('../../config.json');
const port = config.websocket.port;
const host = config.websocket.host;
const password = config.websocket.password;

let websocket: ws.WebSocket;
let client: discord.Client;

export async function WSConnect() {
    websocket = new ws(`ws://${host}:${port}`);
    websocket.on('open', () => {
        console.log('Connected to websocket');
        const auth = {
            "type": "auth",
            "token": password
        }
        websocket.send(JSON.stringify(auth));
    });
    websocket.on('message', (data: string) => {
        data = data.toString();
        if(!isJson(data)) return;
        const json = JSON.parse(data);

    });
    websocket.on('close', () => {
        console.log('Disconnected from websocket');
        WSConnect();
    });
    websocket.on('error', (err) => {
        console.error(err);
    });
}

export async function send(data: string) {
    if(!websocket) return false;
    if(websocket.readyState !== websocket.OPEN) return false;
    if (!data) return false;
    websocket.send(data);
    return true;
}

function isJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}