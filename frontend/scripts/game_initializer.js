import {fetchCsrfToken, joinRoom} from './utils.js'
import WebSocketManager from './managers/websocket_manager.js'
import CanvasManager from './managers/canvas_manager.js'
import ChatManager from './managers/chat_manager.js'

// Parse query parameters
const params = new URLSearchParams(window.location.search);
const username = params.get('username');
const room_code = params.get('room_code') || '';
const room_type = params.get('room_type') || 'public';

console.log(username, room_code, room_type);

// Configuration
const WS_BASE_URL = "wss://guessit.up.railway.app/ws/";

// Initialize game
export async function initializeGame(player_name, room_code, room_type) {
    try {
        const csrfToken = await fetchCsrfToken();
        const response = await joinRoom(csrfToken, player_name, room_code, room_type);
        
        if (response === null || response === false) {
            window.location.href = `index.html`
            return
        }

        const { id: playerId, room: roomId } = response
        console.log("Joined room:", roomId, "as player:", playerId);
        const wsUrl = `${WS_BASE_URL}${roomId}/${playerId}/`;

        const wsManager = new WebSocketManager(wsUrl, player_name, (canvasdata) => canvasManager.websocketActions(canvasdata), (chatdata) => chatManager.displayMessage(chatdata));
        const canvasManager = new CanvasManager(wsManager);
        const chatManager = new ChatManager(wsManager);


    } catch (error) {
        console.error("Error initializing game: ", error);
        window.location.href = 'index.html';
        alert(error)
    }
}

// Start the game
initializeGame(username, room_code, room_type);