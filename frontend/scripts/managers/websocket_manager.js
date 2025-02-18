// WebSocket Manager Class
export default class WebSocketManager {
    constructor(url, playerName, canvasMessageHandler, chatMessageHandler) {
      this.playerName = playerName;
      this.drawerName = '';
      this.currentWord = '';
      this.turnCount = null;
      this.gameStarted = false;
      this.skipTurn = false;
      this.countDownInterval = null;
  
      this.url = url;
      this.canvasMessageHandler = canvasMessageHandler;
      this.chatMessageHandler = chatMessageHandler;
      this.connect();
    }
  
    connect() {
      this.socket = new WebSocket(this.url);
      this.socket.onopen = () =>
        console.log("Connected to WebSocket server.");
      this.socket.onmessage = this.onMessage.bind(this);
      this.socket.onclose = this.onClose.bind(this);
      this.socket.onerror = this.onError.bind(this);
    }
  
    updateHeader() {
      const timerElem = document.getElementById("timer");
      if (timerElem) timerElem.textContent = "0";
  
      const wordElem = document.getElementById("word");
      if (wordElem) wordElem.textContent = this.currentWord || "_ _ _ _";
  
      const counterElem = document.getElementById("counter");
      if (counterElem)
        counterElem.textContent = this.turnCount
          ? `Round: ${this.turnCount}`
          : "Round:";
    }
  
    onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        const chatMessageTypes = new Set([
          "guess",
          "chat_message",
          "player_joined",
          "player_left",
        ]);
        const drawingMessageTypes = new Set(["drawing", "clear_canvas"]);
  
        if (drawingMessageTypes.has(data.type)) {
          this.canvasMessageHandler(data);
        } else if (chatMessageTypes.has(data.type)) {
          this.chatMessageHandler(data);
          this.updateHeader();
        } else {
          switch (data.type) {
            case "ping":
              console.log("pong");
              break;
            case "new_game":
              this.handleNewGame(data);
              break;
            case "new_turn":
              console.log('Drawer: ', this.drawerName,);
              this.handleNewTurn(data);
              break;
            case "game_over":
              this.handleDisplayFinalScore(data);
              break;
            case "hint_update":
              this.currentWord = data.hint;
              this.updateHeader();
              break;
            case "skipping_turn":
              this.skipTurn = true;
              break;
            case "leaderboard_update":
              this.handleLeaderboardUpdate(data);
              break;
            case "display_score":
              this.handleDisplayScore(data);
              break;
            case "word_choices":
              if (this.drawerName === this.playerName) {
                this.handleWordChoices(data);
              }
              break;
            case "drawer_choosing_word":
              if (this.drawerName !== this.playerName) {
                this.handleDrawerChoosingWord(data);
              }
              break;
            case "clear_modal":
              this.handleClearModal();
              break;
            default:
              console.log(this.playerName, "----", this.drawerName);
              console.log(`Received message: ${data.message}`);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  
    // Handles new game initialization and countdown display.
    handleNewGame(data) {
      this.gameStarted = true;
  
      let seconds = data.timeout;
      const modal = document.getElementById("new-game-modal");
      const timerElem = document.getElementById("timer");
      if (modal) modal.style.display = "flex";
  
      const countdown = setInterval(() => {
        seconds--;
        if (timerElem) timerElem.textContent = seconds;
        if (seconds <= 1) {
          clearInterval(countdown);
          if (timerElem) timerElem.textContent = "Don't lose!";
          setTimeout(() => {
            if (modal) modal.style.display = "none";
          }, 2000);
        }
      }, 1000);
    }
  
    // Handles a new turn, updating the drawer and starting a countdown.
    handleNewTurn(data) {
      this.drawerName = data.drawer;
      this.turnCount = data.turn;
      this.skipTurn = false;
      this.updateHeader();
  
      let seconds = data.timeout;
      const countdownElem = document.getElementById("countdown");
      if (countdownElem) countdownElem.textContent = seconds;
  
      if (this.countDownInterval) {
        clearInterval(this.countDownInterval);
      }
      this.countDownInterval = setInterval(() => {
        if (this.skipTurn || seconds <= 0) {
          clearInterval(this.countDownInterval);
          if (countdownElem) countdownElem.textContent = "timeout";
          return;
        }
        seconds--;
        if (countdownElem) countdownElem.textContent = seconds;
      }, 1000);
    }
  
    // Updates the leaderboard list.
    handleLeaderboardUpdate(data) {
      const leaderboardList = document.getElementById("leaderboard-list");
      if (!leaderboardList) return;
      leaderboardList.innerHTML = "";
      data.leaderboard.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = `${player.name}: ${player.score}`;
        
        li.classList.add("list-style");
        
        if (player.name === this.playerName) {
          li.classList.add("player-identifier");
        }
        if (player.name === this.drawerName) {
          li.classList.add("drawer-identifier");
        }
        
        leaderboardList.appendChild(li);
      });
    }    
  
    // Displays Final score.
    handleDisplayFinalScore(data) {
      const timeout = data.timeout;
      const scoreboard = data.scoreboard;

      const modal = document.getElementById("final-scoreboard-modal");
      const scoreboardList = document.getElementById("final-score-lists");
      if (scoreboardList) scoreboardList.innerHTML = "";
  
  
      scoreboard.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = `${player.name}: ${player.score}`;
        if (scoreboardList) scoreboardList.appendChild(li);
      });
  
      if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
          if (modal && modal.style.display === "flex") {
            modal.style.display = "none";
          }
        }, timeout * 1000);
      }
    }

    // Displays the score modal.
    handleDisplayScore(data) {
      const timeout = data.timeout;
      const scoreboard = data.scoreboard;
      const modal = document.getElementById("scoreboard-modal");
      const scoreboardList = document.getElementById("score-lists");
      if (scoreboardList) scoreboardList.innerHTML = "";
  
      const guessWord = document.getElementById("guess-word");
      if (guessWord) guessWord.textContent = `The word is: ${data.word}`;
  
      scoreboard.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = `${player.name}: ${player.score}`;
        if (scoreboardList) scoreboardList.appendChild(li);
      });
  
      if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
          if (modal && modal.style.display === "flex") {
            modal.style.display = "none";
          }
        }, timeout * 1000);
      }
    }
  
    // Shows word choices to the drawer.
    handleWordChoices(data) {
      const wordChoices = data.choices;
      const timeout = data.timeout;
      const modal = document.getElementById("word-choice-modal");
      const wordChoicesList = document.getElementById("word-choices");
      if (!wordChoicesList) return;
      wordChoicesList.innerHTML = "";
  
      wordChoices.forEach((word) => {
        const li = document.createElement("li");
        li.textContent = word;
        li.addEventListener("click", () => {
          this.socket.send(
            JSON.stringify({
              type: "word_chosen",
              word: word,
              name: this.playerName,
            })
          );
          if (modal) modal.style.display = "none";
        });
        wordChoicesList.appendChild(li);
      });
  
      if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
          if (modal && modal.style.display === "flex") {
            modal.style.display = "none";
          }
        }, timeout * 1000);
      }
    }
  
    // Displays a modal when another player is choosing a word.
    handleDrawerChoosingWord(data) {
      const timeout = data.timeout;
      const modal = document.getElementById("drawer-choosing-modal");
      const header = document.getElementById("drawer-choosing");
      if (header)
        header.textContent = `${this.drawerName} is choosing a word...`;
      if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
          if (modal && modal.style.display === "flex") {
            modal.style.display = "none";
          }
        }, timeout * 1000);
      }
    }
  
    // Hides all modals.
    handleClearModal() {
      const modals = document.getElementsByClassName("modal");
      if (!modals.length) {
        console.warn("No modals found to clear.");
        return;
      }
      for (const modal of modals) {
        modal.style.display = "none";
      }
    }
  
    onClose() {
      console.warn("WebSocket disconnected. Reconnecting...");
      // Uncomment the next line to enable reconnection:
      // setTimeout(() => this.connect(), 3000);
    }
  
    onError(error) {
      console.error("WebSocket error:", error);
    }
  
    sendMessage(message) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket not open. Message not sent:", message);
      }
    }
  }
  