
class GameClient {
    userId;
    clientId;
    username;
    socket;
    role;
    disconnected;
    isReady;
    roomId;
    connectedAt;
    ping = 0;
    constructor(userId, socket, role = "PLAYER", roomId, clientId, username) {
        this.userId = userId;
        this.clientId = clientId;
        this.connectedAt = Date.now();
        this.isReady = false;
        this.role = role;
        this.username = username;
        this.socket = socket;
        this.roomId = roomId;
        this.disconnected = false;
    }
    getUserId() {
        return this.userId;
    }
    getClientId() {
        return this.clientId;
    }
    getUsername() {
        return this.username;
    }
    getSocket() {
        return this.socket;
    }
    getRole() {
        return this.role;
    }
    getRoomId() {
        return this.roomId;
    }
    getIsReady() {
        return this.isReady;
    }
    getConnectedAt() {
        return this.connectedAt;
    }
    getPing() {
        return this.ping;
    }
    // ----- SETTERS -----
    setClientId(clientId) {
        this.clientId = clientId;
    }
    setUsername(username) {
        this.username = username;
    }
    setRole(role) {
        this.role = role;
    }
    setIsReady(isReady) {
        this.isReady = isReady;
    }
    setRoomId(roomId) {
        this.roomId = roomId;
    }
    setPing(ping) {
        this.ping = ping;
    }
    isPlayer() {
        return this.role == 'PLAYER';
    }
    isSpectator() {
        return this.role == 'SPECTATOR';
    }
    isDisconnected() {
        return this.disconnected;
    }
    setDisconnected(status) {
        this.disconnected = status;
    }
    send(data) {
        this.socket.send(JSON.stringify(data));
    }
}
module.exports =  GameClient;
