const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

window.addEventListener('resize', (e) => {
  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 20;
});

let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseup', (e) => {
  addParticle(e.x, e.y);
});

// Set up variables affecting refraction
let REFRACTIVE_INDEX1 = 1.0,
  REFRACTIVE_INDEX2 = 2.33,
  SPEED1 = 300,
  SPEED2 = 226.0;

let MAX_PARTICLES = 10;

// Set up particles array
let particles = [];

// Managing particles
function addParticle(x, y) {
  let particle = {
    x,
    y,

    // Velocity
    dx: Math.random() * 5 - 1,
    dy: Math.random() * 5 - 1,

    initialSubstance: setSub(y),
  };

  particles.push(particle);
}

// Determines which substance the particle is in
function setSub(y) {
  return y < canvas.height / 2 ? 1 : 2;
}

// Snell's law: n1sin(theta1) = n2sin(theta2)
function calcNewAngle(dx, dy, sub) {
  // Angle of incidence is calculated relative to normal line
  let theta1 = Math.atan(dx / dy);
  const n1 = REFRACTIVE_INDEX1,
  n2 = REFRACTIVE_INDEX2;
  let theta2;

  if (sub === 1) {
    theta2 = Math.asin((n1 * Math.sin(theta1)) / n2);
  } else {
    theta2 = Math.asin((n2 * Math.sin(theta1)) / n1);
  }

  console.log(theta1, theta2);
  return Math.tan(theta2);
}

// Animate the canvas:
function animate() {
  requestAnimationFrame(animate);
  updatePosition();

  draw();
}

function updatePosition() {
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    particle.x += particle.dx;
    particle.y += particle.dy;

    if (particle.x < 0) {
      particle.dx = Math.abs(particle.dx);
    }
    if (particle.x > canvas.width) {
      particle.dx = -Math.abs(particle.dx);
    }
    if (particle.y < 0) {
      particle.dy = Math.abs(particle.dy);
    }
    if (particle.y > canvas.height) {
      particle.dy = -Math.abs(particle.dy);
    }

    if (checkForBoundary(particle)) {
      updateSpeed(particle);
      updateAngle(particle);
      updateSubstance(particle);
    }
  }
}

function updateSpeed(p) {
  if (p.initialSubstance === 1) {
    let ratio = SPEED2 / SPEED1;
    p.dx *= ratio;
    p.dy *= ratio;
  } else if (p.initialSubstance === 2) {
    let ratio = SPEED1 / SPEED2;
    p.dx *= ratio;
    p.dy *= ratio;
  }
}

function updateSubstance(p) {
  p.initialSubstance === 1
    ? (p.initialSubstance = 2)
    : (p.initialSubstance = 1);
}

function updateAngle(p) {
  let newAngle = calcNewAngle(p.dx, p.dy, p.initialSubstance);

  // newAngle is the tangent of the angle itself. Provides ratio
  // of dy / dx
  if(Math.abs(newAngle) < 1) {
    p.dx = newAngle * p.dy;
  }
  if(Math.abs(newAngle) > 1) {
    p.dy = p.dx * newAngle;
  }
  
}

// Returns true if particle has passed substance boundary
function checkForBoundary(p) {
  if (p.initialSubstance === 1 && p.y > canvas.height / 2) {
    return true;
  }
  if (p.initialSubstance === 2 && p.y < canvas.height / 2) {
    return true;
  }

  return false;
}

function draw() {
  c.fillStyle = '#222';
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = '#292929';
  c.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

  // Draw particles
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    c.beginPath();
    c.arc(particle.x, particle.y, 5, 0, Math.PI * 2, false);
    c.fillStyle = '#ddd';
    c.fill();
  }

  // Show circle at current mouse position
  c.beginPath();
  c.arc(mouse.x, mouse.y, 5, Math.PI * 2, false);
  c.fillStyle = '#ddd';
  c.fill();
}

animate();
