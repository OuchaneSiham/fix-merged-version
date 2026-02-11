// Modify this class to add radius

class Ball {
  x;
  y;
  vx;
  vy;
  speed; 
  radius = 10; 

  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.reset(); 
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime; 
    this.y += this.vy * deltaTime;
  }

  reset() {
    this.x = 400;
    this.y = 300;
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
    const dir = Math.random() < 0.5 ? 1 : -1;
    this.vx = Math.cos(angle) * this.speed * dir;
    this.vy = Math.sin(angle) * this.speed;
  }

  resetSpeed(initialSpeed) {
    this.speed = initialSpeed;
  }
  bounceX() {
    this.vx = -this.vx;
  }
  bounceY() {
    this.vy *= -1;
  }
  getState() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  getVelocity() {
    return { vx: this.vx, vy: this.vy };
  }

  setPosition(x, y) {
    this.x = x;
    if (y !== undefined) {
      this.y = y;
    }
  }
  setSpeed(ratio) {
    this.speed *= ratio;
  }
}

// export default Ball;
module.exports = Ball
