document.getElementById('join').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const room_code = document.getElementById('room').value.trim();

    // Validate username
    if (!username || username.length >= 15) {
        alert('Username must be between 1 to 14 characterns');
        return;
    }

    // Handle room joining logic
    if (room_code.length > 0) {
        if (room_code.length < 5 || room_code.length > 8) {
            alert('Private room code must be between 5 to 8 characters long.');
            return;
        }
        // If room code is valid treat it as a private room
        window.location.href = `game_room.html?username=${encodeURIComponent(username)}&room_code=${room_code}`;
    } else {
        // If no room code is specified, treat it as joining a public room
        window.location.href = `game_room.html?username=${encodeURIComponent(username)}`;
    }
});

// Create private room button logic
document.getElementById('create-private-room').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const room_code = document.getElementById('room').value.trim();
    const room_type = 'private';

    // Validate username
    if (!username || username.length >= 15) {
        alert('Length of username must be between 1 and 14');
        return;
    }

    // Handle room joining logic
    if (room_code.length > 0) {
        if (room_code.length < 5 || room_code.length > 8) {
            alert('Private room code must be between 5 to 8 characters long.');
            return;
        }
        // If room code is valid treat it as a private room
        window.location.href = `game_room.html?username=${encodeURIComponent(username)}&room_code=${room_code}&room_type=${encodeURIComponent(room_type)}`;
    } else {
        alert('You must provide a unique identifier to create private room.')
        return
    }
});


// Function to generate a random 8-character room code
// function generateRandomRoomCode() {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let roomCode = '';
//     for (let i = 0; i < 8; i++) {
//         roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return roomCode;
// }
