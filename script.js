// Screen elements
const codeScreen = document.getElementById('code-screen');
const codeInput = document.getElementById('code-input');
const codeSubmit = document.getElementById('code-submit');
const codeError = document.getElementById('code-error');
const introScreen = document.getElementById('intro-screen');
const countdownScreen = document.getElementById('countdown-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const finalScreen = document.getElementById('final-screen');
const oopsScreen = document.getElementById('oops-screen');
const introMessages = document.getElementById('intro-messages');
const fireworksCanvas = document.getElementById('fireworks-canvas');

// Floating images
const floatingHareem = document.getElementById('floating-hareem');
const floatingWaseem = document.getElementById('floating-waseem');
const loveEmoji = document.getElementById('love-emoji');

// Messages for intro screen
const messages = [
    "Hello Hareem Fatima…",
    "Hello Waseem…",
    "Happy to see your friendship cross 2 beautiful years…",
    "Now celebrating New Year 2026 together…",
    "Wishing your friendship stays strong and forever…"
];

// Audio context for sound effects
let audioContext;
let fireworksSoundBuffer;

// Initialize audio context
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createFireworksSound();
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Create fireworks sound using Web Audio API
function createFireworksSound() {
    if (!audioContext) return;
    
    const sampleRate = audioContext.sampleRate;
    const duration = 0.3;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Create a burst sound effect
        data[i] = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 10) * 
                  (Math.random() * 0.5 + 0.5) * Math.exp(-t * 5);
    }
    
    fireworksSoundBuffer = buffer;
}

// Play fireworks sound
function playFireworksSound() {
    if (!audioContext || !fireworksSoundBuffer) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = fireworksSoundBuffer;
    source.connect(audioContext.destination);
    source.start(0);
}

// Typewriter effect for messages
function typewriterEffect(text, element, callback) {
    element.textContent = '';
    element.classList.add('typewriter');
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        } else {
            element.classList.remove('typewriter');
            if (callback) {
                setTimeout(callback, 1500);
            }
        }
    }
    
    type();
}


// Show intro messages sequentially
function showIntroMessages() {
    let currentIndex = 0;
    
    // Create a single message container that will be reused
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-3xl md:text-5xl font-display font-bold text-white fade-in tracking-tight';
    introMessages.appendChild(messageDiv);
    
    function showNextMessage() {
        if (currentIndex >= messages.length) {
            // All messages shown, move to countdown
            setTimeout(() => {
                introScreen.classList.add('hidden');
                showCountdown();
            }, 2000);
            return;
        }
        
        // Clear previous message and show new one with animation
        messageDiv.textContent = '';
        messageDiv.classList.remove('fade-in');
        // Force reflow to restart animation
        void messageDiv.offsetWidth;
        messageDiv.classList.add('fade-in');
        
        typewriterEffect(messages[currentIndex], messageDiv, () => {
            currentIndex++;
            if (currentIndex < messages.length) {
                setTimeout(showNextMessage, 500);
            } else {
                setTimeout(() => {
                    introScreen.classList.add('hidden');
                    showCountdown();
                }, 2000);
            }
        });
    }
    
    showNextMessage();
}

// Countdown timer
function showCountdown() {
    countdownScreen.classList.remove('hidden');
    
    const targetDate = new Date('2026-01-01T00:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            // Countdown finished
            countdownScreen.classList.add('hidden');
            showCelebration();
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        // Add flip animation when numbers change
        if (daysEl.textContent !== String(days).padStart(2, '0')) {
            daysEl.classList.add('flip');
            setTimeout(() => daysEl.classList.remove('flip'), 300);
        }
        if (hoursEl.textContent !== String(hours).padStart(2, '0')) {
            hoursEl.classList.add('flip');
            setTimeout(() => hoursEl.classList.remove('flip'), 300);
        }
        if (minutesEl.textContent !== String(minutes).padStart(2, '0')) {
            minutesEl.classList.add('flip');
            setTimeout(() => minutesEl.classList.remove('flip'), 300);
        }
        if (secondsEl.textContent !== String(seconds).padStart(2, '0')) {
            secondsEl.classList.add('flip');
            setTimeout(() => secondsEl.classList.remove('flip'), 300);
        }
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Allow skipping countdown with click or swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    countdownScreen.addEventListener('click', () => {
        clearInterval(countdownInterval);
        countdownScreen.classList.add('hidden');
        showCelebration();
    });
    
    countdownScreen.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    countdownScreen.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            clearInterval(countdownInterval);
            countdownScreen.classList.add('hidden');
            showCelebration();
        }
    });
}

// Fireworks animation
class Firework {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.particles = [];
        this.exploded = false;
        this.colors = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
            '#ff8800', '#8800ff', '#ff0088', '#88ff00'
        ];
        
        this.explode();
    }
    
    explode() {
        const particleCount = 50;
        const angleStep = (Math.PI * 2) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i;
            const speed = 2 + Math.random() * 3;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02
            });
        }
        
        this.exploded = true;
        playFireworksSound();
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.vx *= 0.98; // friction
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const particle of this.particles) {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    isDead() {
        return this.particles.length === 0;
    }
}

// Fireworks system
let fireworks = [];
let animationId;
let celebrationAudio = null;

function showCelebration() {
    celebrationScreen.classList.remove('hidden');
    
    // Play celebration audio
    if (!celebrationAudio) {
        celebrationAudio = new Audio('New_Year_Celebration_mp3_1710934930.mp3');
        celebrationAudio.loop = true;
        celebrationAudio.volume = 0.7;
    }
    celebrationAudio.play().catch(e => {
        console.log('Audio play failed:', e);
    });
    
    // Setup canvas
    const ctx = fireworksCanvas.getContext('2d');
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    
    // Reset welcome animation
    const welcomeText = document.getElementById('welcome-2026');
    welcomeText.classList.remove('welcome-animation');
    setTimeout(() => {
        welcomeText.classList.add('welcome-animation');
    }, 10);
    
    // Create celebrating people at the bottom
    const celebratingPeopleContainer = document.getElementById('celebrating-people');
    celebratingPeopleContainer.innerHTML = ''; // Clear any existing
    
    const numberOfPeople = window.innerWidth < 768 ? 5 : 7;
    const colors = [
        { skin: '#FFDBAC', hair: '#8B4513', shirt: '#FF6B6B', pants: '#4ECDC4' },
        { skin: '#F4C2A1', hair: '#654321', shirt: '#95E1D3', pants: '#F38181' },
        { skin: '#E6BC93', hair: '#3D2817', shirt: '#AA96DA', pants: '#FCBAD3' },
        { skin: '#D4A574', hair: '#2C1810', shirt: '#FFD93D', pants: '#6BCB77' },
        { skin: '#C19A6B', hair: '#1A0F08', shirt: '#FF6B9D', pants: '#C44569' },
        { skin: '#FFDBAC', hair: '#8B4513', shirt: '#4ECDC4', pants: '#45B7D1' },
        { skin: '#F4C2A1', hair: '#654321', shirt: '#F38181', pants: '#95E1D3' }
    ];
    
    function createPersonSVG(colorSet, index) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 60 80');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Head
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', '30');
        head.setAttribute('cy', '15');
        head.setAttribute('r', '10');
        head.setAttribute('fill', colorSet.skin);
        svg.appendChild(head);
        
        // Hair
        const hair = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        hair.setAttribute('cx', '30');
        hair.setAttribute('cy', '12');
        hair.setAttribute('rx', '11');
        hair.setAttribute('ry', '8');
        hair.setAttribute('fill', colorSet.hair);
        svg.insertBefore(hair, head);
        
        // Left arm (raised) - animated - draw before body so it's visible
        const leftArmGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const leftArm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        leftArm.setAttribute('x', '18');
        leftArm.setAttribute('y', '28');
        leftArm.setAttribute('width', '7');
        leftArm.setAttribute('height', '22');
        leftArm.setAttribute('rx', '3.5');
        leftArm.setAttribute('fill', colorSet.skin);
        const leftArmAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        leftArmAnim.setAttribute('attributeName', 'transform');
        leftArmAnim.setAttribute('type', 'rotate');
        leftArmAnim.setAttribute('values', '-35 21.5 39;-55 21.5 39;-35 21.5 39');
        leftArmAnim.setAttribute('dur', '1s');
        leftArmAnim.setAttribute('repeatCount', 'indefinite');
        leftArmGroup.setAttribute('transform', 'rotate(-35 21.5 39)');
        leftArmGroup.appendChild(leftArm);
        leftArmGroup.appendChild(leftArmAnim);
        svg.appendChild(leftArmGroup);
        
        // Right arm (raised) - animated - draw before body so it's visible
        const rightArmGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const rightArm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rightArm.setAttribute('x', '35');
        rightArm.setAttribute('y', '28');
        rightArm.setAttribute('width', '7');
        rightArm.setAttribute('height', '22');
        rightArm.setAttribute('rx', '3.5');
        rightArm.setAttribute('fill', colorSet.skin);
        const rightArmAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        rightArmAnim.setAttribute('attributeName', 'transform');
        rightArmAnim.setAttribute('type', 'rotate');
        rightArmAnim.setAttribute('values', '35 38.5 39;55 38.5 39;35 38.5 39');
        rightArmAnim.setAttribute('dur', '1s');
        rightArmAnim.setAttribute('begin', '0.1s');
        rightArmAnim.setAttribute('repeatCount', 'indefinite');
        rightArmGroup.setAttribute('transform', 'rotate(35 38.5 39)');
        rightArmGroup.appendChild(rightArm);
        rightArmGroup.appendChild(rightArmAnim);
        svg.appendChild(rightArmGroup);
        
        // Body (shirt) - draw after arms so body is on top
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '20');
        body.setAttribute('y', '28');
        body.setAttribute('width', '20');
        body.setAttribute('height', '22');
        body.setAttribute('rx', '3');
        body.setAttribute('fill', colorSet.shirt);
        svg.appendChild(body);
        
        // Legs (pants)
        const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        leftLeg.setAttribute('x', '22');
        leftLeg.setAttribute('y', '50');
        leftLeg.setAttribute('width', '7');
        leftLeg.setAttribute('height', '25');
        leftLeg.setAttribute('rx', '3');
        leftLeg.setAttribute('fill', colorSet.pants);
        svg.appendChild(leftLeg);
        
        const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rightLeg.setAttribute('x', '31');
        rightLeg.setAttribute('y', '50');
        rightLeg.setAttribute('width', '7');
        rightLeg.setAttribute('height', '25');
        rightLeg.setAttribute('rx', '3');
        rightLeg.setAttribute('fill', colorSet.pants);
        svg.appendChild(rightLeg);
        
        // Feet
        const leftFoot = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        leftFoot.setAttribute('cx', '25');
        leftFoot.setAttribute('cy', '77');
        leftFoot.setAttribute('rx', '5');
        leftFoot.setAttribute('ry', '3');
        leftFoot.setAttribute('fill', '#2C3E50');
        svg.appendChild(leftFoot);
        
        const rightFoot = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        rightFoot.setAttribute('cx', '35');
        rightFoot.setAttribute('cy', '77');
        rightFoot.setAttribute('rx', '5');
        rightFoot.setAttribute('ry', '3');
        rightFoot.setAttribute('fill', '#2C3E50');
        svg.appendChild(rightFoot);
        
        return svg;
    }
    
    for (let i = 0; i < numberOfPeople; i++) {
        const person = document.createElement('div');
        person.className = 'celebrating-person';
        person.style.animationDelay = `${i * 0.2}s`;
        const personSVG = createPersonSVG(colors[i % colors.length], i);
        person.appendChild(personSVG);
        celebratingPeopleContainer.appendChild(person);
    }
    
    // Create initial fireworks
    function createFirework() {
        const x = Math.random() * fireworksCanvas.width;
        const y = Math.random() * fireworksCanvas.height * 0.5;
        fireworks.push(new Firework(x, y, fireworksCanvas));
    }
    
    // Create fireworks periodically
    const fireworkInterval = setInterval(() => {
        if (Math.random() > 0.3) {
            createFirework();
        }
    }, 800);
    
    // Animation loop
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const firework = fireworks[i];
            firework.update();
            firework.draw(ctx);
            
            if (firework.isDead()) {
                fireworks.splice(i, 1);
            }
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Create initial burst
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createFirework(), i * 200);
        }
    }, 500);
    
    // Move to final screen after celebration
    setTimeout(() => {
        clearInterval(fireworkInterval);
        cancelAnimationFrame(animationId);
        celebrationScreen.classList.add('hidden');
        // Stop celebration audio
        if (celebrationAudio) {
            celebrationAudio.pause();
            celebrationAudio.currentTime = 0;
        }
        showFinalMessage();
    }, 25000);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    });
}

// Show final message
function showFinalMessage() {
    finalScreen.classList.remove('hidden');
}

// Generate access code based on current time
function generateAccessCode() {
    const now = new Date();
    const minutes = now.getMinutes();
    const secret = minutes * 2;
    
    // Return code in format: 1155{secret}
    return '1155' + secret;
}

// Validate entered code
function validateCode(enteredCode) {
    const correctCode = generateAccessCode();
    return enteredCode.trim() === correctCode;
}

// Handle code submission
function handleCodeSubmit() {
    const enteredCode = codeInput.value.trim();
    codeError.classList.add('hidden');
    
    if (validateCode(enteredCode)) {
        // Correct code - hide code screen and show intro
        codeScreen.classList.add('hidden');
        introScreen.classList.remove('hidden');
        // Show floating images after code validation
        if (floatingHareem) floatingHareem.style.display = 'block';
        if (floatingWaseem) floatingWaseem.style.display = 'block';
        showIntroMessages();
    } else {
        // Incorrect code - show error
        codeError.classList.remove('hidden');
        codeInput.value = '';
        codeInput.focus();
    }
}

// Initialize code screen
function initCodeScreen() {
    // Hide floating images on code screen
    if (floatingHareem) floatingHareem.style.display = 'none';
    if (floatingWaseem) floatingWaseem.style.display = 'none';
    
    if (codeSubmit && codeInput) {
        codeSubmit.addEventListener('click', handleCodeSubmit);
        
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleCodeSubmit();
            }
        });
        
        // Focus on input when screen loads
        codeInput.focus();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    initFloatingImages();
    initCodeScreen();
    // Don't show intro messages until code is validated
});

// Floating images animation
class FloatingImage {
    constructor(element) {
        this.element = element;
        this.x = Math.random() * (window.innerWidth - 80);
        this.y = Math.random() * (window.innerHeight - 80);
        this.vx = (Math.random() - 0.5) * 2; // Random velocity between -1 and 1
        this.vy = (Math.random() - 0.5) * 2;
        this.size = window.innerWidth < 768 ? 60 : 80;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Set initial position
        this.updatePosition();
        this.setupDragHandlers();
    }
    
    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    setupDragHandlers() {
        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.startDrag(e.clientX, e.clientY));
        document.addEventListener('mousemove', (e) => this.onDrag(e.clientX, e.clientY));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag(touch.clientX, touch.clientY);
        });
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.onDrag(touch.clientX, touch.clientY);
            }
        });
        document.addEventListener('touchend', () => this.endDrag());
    }
    
    startDrag(clientX, clientY) {
        this.isDragging = true;
        // Calculate offset from mouse/touch position to image position
        this.offsetX = clientX - this.x;
        this.offsetY = clientY - this.y;
        // Reset velocity when starting to drag
        this.vx = 0;
        this.vy = 0;
    }
    
    onDrag(clientX, clientY) {
        if (!this.isDragging) return;
        
        // Update position based on mouse/touch position minus offset
        this.x = clientX - this.offsetX;
        this.y = clientY - this.offsetY;
        
        // Keep within bounds
        this.x = Math.max(0, Math.min(window.innerWidth - this.size, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight - this.size, this.y));
        
        this.updatePosition();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        // Give a small random velocity after release
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }
    
    update() {
        // Don't update position automatically if being dragged
        if (this.isDragging) return;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Check border collisions and bounce back
        if (this.x <= 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx); // Reverse direction
        } else if (this.x >= window.innerWidth - this.size) {
            this.x = window.innerWidth - this.size;
            this.vx = -Math.abs(this.vx); // Reverse direction
        }
        
        if (this.y <= 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy); // Reverse direction
        } else if (this.y >= window.innerHeight - this.size) {
            this.y = window.innerHeight - this.size;
            this.vy = -Math.abs(this.vy); // Reverse direction
        }
        
        // Occasionally change direction slightly for more random movement
        if (Math.random() < 0.01) {
            this.vx += (Math.random() - 0.5) * 0.5;
            this.vy += (Math.random() - 0.5) * 0.5;
            
            // Limit velocity
            this.vx = Math.max(-2, Math.min(2, this.vx));
            this.vy = Math.max(-2, Math.min(2, this.vy));
        }
        
        this.updatePosition();
    }
}

// Initialize floating images
let hareemFloating, waseemFloating;
let floatingAnimationId;
let emojiX = 0;
let emojiY = 0;
let emojiVx = 0;
let emojiVy = 0;
let isTouching = false;

// Check collision between two images
function checkCollision(img1, img2) {
    const centerX1 = img1.x + img1.size / 2;
    const centerY1 = img1.y + img1.size / 2;
    const centerX2 = img2.x + img2.size / 2;
    const centerY2 = img2.y + img2.size / 2;
    
    const distance = Math.sqrt(
        Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
    );
    
    // Check if images are touching (distance less than sum of radii)
    return distance < (img1.size / 2 + img2.size / 2);
}

// Update emoji position and visibility
function updateEmoji() {
    if (!loveEmoji) return;
    
    if (isTouching) {
        // Show emoji
        loveEmoji.classList.add('visible');
        
        // Position emoji between the two images
        const centerX1 = hareemFloating.x + hareemFloating.size / 2;
        const centerY1 = hareemFloating.y + hareemFloating.size / 2;
        const centerX2 = waseemFloating.x + waseemFloating.size / 2;
        const centerY2 = waseemFloating.y + waseemFloating.size / 2;
        
        emojiX = (centerX1 + centerX2) / 2;
        emojiY = (centerY1 + centerY2) / 2 - 30; // Slightly above the center
        
        // Add floating movement
        emojiX += Math.sin(Date.now() / 500) * 10;
        emojiY += Math.cos(Date.now() / 400) * 10;
        
        // Keep emoji within bounds
        emojiX = Math.max(30, Math.min(window.innerWidth - 30, emojiX));
        emojiY = Math.max(30, Math.min(window.innerHeight - 30, emojiY));
        
        // Position emoji with transform offset (since we use translate(-50%, -50%))
        loveEmoji.style.left = emojiX + 'px';
        loveEmoji.style.top = emojiY + 'px';
    } else {
        // Hide emoji
        loveEmoji.classList.remove('visible');
    }
}

function initFloatingImages() {
    if (floatingHareem && floatingWaseem) {
        hareemFloating = new FloatingImage(floatingHareem);
        waseemFloating = new FloatingImage(floatingWaseem);
        
        function animateFloating() {
            hareemFloating.update();
            waseemFloating.update();
            
            // Check for collision
            const touching = checkCollision(hareemFloating, waseemFloating);
            isTouching = touching;
            
            // Update emoji
            updateEmoji();
            
            floatingAnimationId = requestAnimationFrame(animateFloating);
        }
        
        animateFloating();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Adjust size
            const newSize = window.innerWidth < 768 ? 60 : 80;
            hareemFloating.size = newSize;
            waseemFloating.size = newSize;
            
            // Keep images within bounds
            if (hareemFloating.x > window.innerWidth - newSize) {
                hareemFloating.x = window.innerWidth - newSize;
            }
            if (hareemFloating.y > window.innerHeight - newSize) {
                hareemFloating.y = window.innerHeight - newSize;
            }
            if (waseemFloating.x > window.innerWidth - newSize) {
                waseemFloating.x = window.innerWidth - newSize;
            }
            if (waseemFloating.y > window.innerHeight - newSize) {
                waseemFloating.y = window.innerHeight - newSize;
            }
        });
    }
}

// Resume audio context on user interaction (required by browsers)
document.addEventListener('click', () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });

