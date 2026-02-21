// --- 1. GENTLE STARFIELD ---
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
let speed = 0.05; 
const STAR_COUNT = 1500;

function resize() {
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width; canvas.height = height;
}

class Star {
    constructor() { this.reset(true); }
    reset(randomZ = false) {
        this.x = (Math.random() - 0.5) * width * 4;
        this.y = (Math.random() - 0.5) * height * 4;
        this.z = randomZ ? Math.random() * width : width;
        this.size = Math.random() * 0.5;
    }
    update() {
        this.z -= speed * 100; 
        if(this.z < 1) this.reset();
    }
    draw() {
        const x = (this.x / this.z) * width + width/2;
        const y = (this.y / this.z) * height + height/2;
        const s = (1 - this.z/width) * 3; 
        const alpha = (1 - this.z/width) * 0.7;
        if(x>0 && x<width && y>0 && y<height && alpha>0) {
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(x,y,s,0,Math.PI*2);
            ctx.fill();
        }
    }
}

function initStars() {
    resize(); stars = [];
    for(let i=0; i<STAR_COUNT; i++) stars.push(new Star());
    animateStars();
}

function animateStars() {
    ctx.fillStyle = `rgba(0,0,0,1.0)`; 
    ctx.fillRect(0,0,width,height);
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', resize);
initStars();


// --- 2. SIMPLE FLUID MOUSE MOVEMENT ---
const textElements = document.querySelectorAll('.fluid-text, .label');
const imageElements = document.querySelectorAll('.holo-card');
let mouseX = 0; let mouseY = 0;
let currentMouseX = 0; let currentMouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
});

function animateMouse() {
    currentMouseX += (mouseX - currentMouseX) * 0.1;
    currentMouseY += (mouseY - currentMouseY) * 0.1;

    // Simple fluid movement for text elements
    textElements.forEach(el => {
        const moveX = currentMouseX * -0.03; 
        const moveY = currentMouseY * -0.03;
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        if(el.tagName === 'H1') {
            el.style.textShadow = `${-moveX * 2}px ${-moveY * 2}px 20px rgba(0,0,0,1)`;
        }
    });

    // Simple fluid movement for image elements - handle different layouts
    imageElements.forEach(el => {
        const moveX = currentMouseX * -0.02;
        const moveY = currentMouseY * -0.02;
        
        // Get the section this card belongs to
        const section = el.closest('.section');
        const sectionId = section ? section.id : '';
        
        // Apply different positioning based on section and card
        if (sectionId === 'sec-1') {
            // Section 1: Three boxes with side ones shorter
            let baseX = 0;
            if (el.classList.contains('card-1')) baseX = -120;
            if (el.classList.contains('card-3')) baseX = 120;
            el.style.transform = `translateX(${baseX}px) translate(${moveX}px, ${moveY}px)`;
            
        } else if (sectionId === 'sec-3') {
            // Section 3: Two boxes (left and right)
            let baseX = 0;
            if (el.classList.contains('card-1')) baseX = -80;
            if (el.classList.contains('card-3')) baseX = 80;
            el.style.transform = `translateX(${baseX}px) translate(${moveX}px, ${moveY}px)`;
            
        } else if (sectionId === 'sec-5') {
            // Section 5: Single center box
            el.style.transform = `translateX(0px) translate(${moveX}px, ${moveY}px)`;
            
        } else {
            // For reverse sections or others, just apply fluid movement
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    requestAnimationFrame(animateMouse);
}
animateMouse();


// --- 3. EMERGE LOGIC (Reduced Blur) ---

const sections = document.querySelectorAll('.section');

// Extended centers for 6 sections
const sectionCenters = [0, 3000, 6000, 9000, 12000, 15000];

// Wide range to ensure no gaps
const activeRange = 3000; 

let targetScroll = 0;
let currentScroll = 0;
const ease = 0.04;

window.addEventListener('scroll', () => { targetScroll = window.scrollY; });

function animateZoom() {
    currentScroll += (targetScroll - currentScroll) * ease;

    // Star speed logic
    let minDist = 99999;
    sections.forEach((sec, i) => {
        const dist = Math.abs(currentScroll - sectionCenters[i]);
        if(dist < minDist) minDist = dist;
    });
    let targetSpeed = 0.05 + ((minDist / activeRange) * 5); 
    speed += (targetSpeed - speed) * 0.05;


    sections.forEach((sec, i) => {
        const center = sectionCenters[i];
        let dist = (currentScroll - center) / activeRange;

        let scale = 1;
        let opacity = 1;
        let blur = 0;

        // --- EMERGE FROM VOID ---
        
        if (dist < -0.9) {
            scale = 3.0; 
            opacity = 0; 
        }
        else if (dist > 0.9) {
            scale = 0.1; 
            opacity = 0;
        }
        else {
            scale = 3.0 + (dist + 0.9) * (-2.9 / 1.8);
            opacity = Math.cos(dist * Math.PI * 0.4);
            if (opacity < 0) opacity = 0;

            // SOFTER BLUR CURVE
            // Using power of 3 makes it stay sharp longer and only blur at the very edges
            blur = Math.pow(Math.abs(dist), 3) * 15;
        }

        sec.style.transform = `scale(${scale})`;
        sec.style.opacity = opacity;
        sec.style.filter = `blur(${blur}px)`;
        
        sec.style.zIndex = Math.floor(100 - (dist * 100));

        if (scale > 0.8 && scale < 1.2) {
            sec.style.pointerEvents = 'auto';
        } else {
            sec.style.pointerEvents = 'none';
        }
    });

    requestAnimationFrame(animateZoom);
}

animateZoom();

// --- 4. MENU LOGIC ---
const menuBtn = document.getElementById('menuToggle');
const fullMenu = document.getElementById('fullMenu');
const menuLinks = document.querySelectorAll('.menu-link');

menuBtn.addEventListener('click', () => {
    fullMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close menu when clicking background text
fullMenu.addEventListener('click', (e) => {
    // Check if we clicked the p tag or the background, not a link
    if(e.target.tagName === 'P' || e.target === fullMenu) {
        fullMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// FIX: Navigation Logic
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Stop default anchor jump

        // Get target pixel position from data attribute
        const targetPos = parseInt(link.getAttribute('data-target'));

        // Close the menu (this preserves the animation because CSS handles the opacity transition)
        fullMenu.classList.remove('active');
        document.body.style.overflow = '';

        // Smooth scroll to the specific section pixel
        window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
        });
    });
});