const keypress = require('keypress');
const { exec } = require('child_process');

let secondsInactive = 0;
let timer;
let isActive = false;

const soundFilePath = 'notify.wav'; // Replace with the actual path to the WAV sound file

// Function to execute when the inactivity period is reached
function inactivityHandler() {
  secondsInactive++;
  console.log(`${secondsInactive} seconds of inactivity`);

  if (secondsInactive === 10) {
    playSoundNotification();
  }
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timer);
  timer = setInterval(inactivityHandler, 1000); // 1000 milliseconds = 1 second
}

// Function to call when a keyboard key is pressed
function onKeyPress() {
  if (isActive) {
    isActive = false;
    secondsInactive = 0;
    console.log("Keypressed");
    resetTimer();
  }
}

// Function to play the sound notification
function playSoundNotification() {
  exec(`powershell -c (New-Object Media.SoundPlayer "${soundFilePath}").PlaySync()`, (error) => {
    if (error) {
      console.error('Error playing sound:', error);
    }
  });
}

// Enable input for keypress events
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// Event listener for keyboard key press
process.stdin.on('keypress', onKeyPress);

// Function to start the timer after inactivity
function startTimerAfterInactivity() {
  if (!isActive) {
    isActive = true;
    setTimeout(resetTimer, 10000); // Start the timer after 10 seconds of inactivity
  }
}

// Event listener for inactivity detection
// Here, I'm assuming you have some kind of event or logic to detect inactivity and call startTimerAfterInactivity() function
// You can replace this with your actual inactivity detection mechanism
// For demonstration purposes, I'm calling it every 5 seconds
setInterval(startTimerAfterInactivity, 5000);

// Start the initial timer
resetTimer();
inactivityHandler(); // Display initial seconds of inactivity
