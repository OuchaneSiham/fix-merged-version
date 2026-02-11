class Paddle {
    width; // Width of the paddle 
    height; // Height of the paddle 
    x; // X position of the paddle 
    y; // Y position of the paddle
    speed; // Speed of the paddle 
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    moveUp(deltaTime) {
        this.y -= this.speed * deltaTime;
    }
    moveDown(deltaTime) {
        this.y += this.speed * deltaTime;
    }
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    };
    reset(y) {
        this.y = y;
    }
}
// export default Paddle; 
module.exports = Paddle
