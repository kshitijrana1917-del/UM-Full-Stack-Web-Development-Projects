// DOM Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const dateInput = document.getElementById('dateInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const messageEl = document.getElementById('message');
const themeToggle = document.getElementById('themeToggle');

// Variables
let countdownDate = null;
let countdownInterval = null;
let isPaused = false;
let remainingTime = 0;

// Set default target date (New Year's Eve of the current year + 1)
const nextYear = new Date().getFullYear() + 1;
const defaultDate = `${nextYear}-01-01T00:00`;
dateInput.value = defaultDate;
countdownDate = new Date(defaultDate).getTime();

// Initialize countdown on page load
updateCountdown();

// Event Listeners
startBtn.addEventListener('click', startCountdown);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetCountdown);
themeToggle.addEventListener('click', toggleTheme);

// Functions
function startCountdown() {
    const inputDate = dateInput.value;
    
    if (!inputDate) {
        alert('Please select a date and time!');
        return;
    }
    
    countdownDate = new Date(inputDate).getTime();
    
    // Check if the date is in the past
    if (countdownDate <= new Date().getTime()) {
        alert('Please select a future date!');
        return;
    }
    
    // Clear any existing interval
    clearInterval(countdownInterval);
    
    // Reset pause state
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    
    // Hide message if visible
    messageEl.classList.add('hidden');
    
    // Start the countdown
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (isPaused) return;
    
    const now = new Date().getTime();
    remainingTime = countdownDate - now;
    
    if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        messageEl.classList.remove('hidden');
        return;
    }
    
    // Calculate time units
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
    // Add leading zeros if needed
    daysEl.textContent = days < 10 ? `0${days}` : days;
    hoursEl.textContent = hours < 10 ? `0${hours}` : hours;
    minutesEl.textContent = minutes < 10 ? `0${minutes}` : minutes;
    secondsEl.textContent = seconds < 10 ? `0${seconds}` : seconds;
}

function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (!isPaused) {
        // Update countdown date based on remaining time
        countdownDate = new Date().getTime() + remainingTime;
        updateCountdown();
    }
}

function resetCountdown() {
    // Clear interval
    clearInterval(countdownInterval);
    
    // Reset display
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    
    // Reset state
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    messageEl.classList.add('hidden');
    
    // Reset date input to default
    const nextYear = new Date().getFullYear() + 1;
    const defaultDate = `${nextYear}-01-01T00:00`;
    dateInput.value = defaultDate;
    countdownDate = new Date(defaultDate).getTime();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Initialize theme based on user preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    toggleTheme();
}