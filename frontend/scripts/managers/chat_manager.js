// Chat Manager class

export default class ChatManager {
    constructor(wsManager) {
        this.wsManager = wsManager;

        this.chatInput = document.getElementById("chat-input");
        this.chatSendButton = document.getElementById("send-message");
        this.chatMessages = document.getElementById("chat-messages");

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Send message on button click
        this.chatSendButton.addEventListener("click", this.sendMessage.bind(this));

        // Send message on Enter key
        this.chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.sendMessage.bind(this);
            }
        });
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Prepare message payload
        const chatMessage = {
            type: "guess",
            guess: message,
        };

        // Send message via WebSocket
        this.wsManager.sendMessage(chatMessage);

        // Clear the input field
        this.chatInput.value = "";
    }

    displayMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.className = `chat-message`;
        if (message.type === "guess") {
            messageElement.textContent = `${message.name}: guessed correctly.`;   
            messageElement.className = 'green-text';
        } else if (message.type === "chat_message") {
            messageElement.textContent = `${message.name}: ${message.message}`; 
        } else if (message.type === "player_joined") {
            messageElement.textContent = `${message.id} joined room`;
            messageElement.className = 'green-text';
        } else if (message.type === "player_left") {
            messageElement.textContent = `${message.id} left room`;
            messageElement.className = 'red-text';
        }
        this.chatMessages.appendChild(messageElement);

        // Scroll to the latest message
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}