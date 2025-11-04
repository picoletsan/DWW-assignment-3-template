document.addEventListener("DOMContentLoaded", function() {

    // do stuffs 
    // documentation for adafruit IO : https://github.com/methio/adafruitIO-class
    // documentation for alwan color picker : https://github.com/sefianecho/alwan
    // documentation for Name That Color (NTC) : https://chir.ag/projects/ntc/
    

});


// ---------------- TIMER & STOPWATCH FUNCTIONALITY ----------------

// Select DOM elements
const startButton = document.querySelector('.start-button');
const stopButton = document.querySelector('.stop-button');
const resetButton = document.querySelector('.reset-button');
const modeButton = document.querySelector('.stopwatch-button');
const timerDisplay = document.querySelector('.timer-bar p');

// Initial state
let timer;
let elapsedMilliseconds = 0;
let isRunning = false;
let isStopwatchMode = false; // false = timer mode, true = stopwatch
let countdownDuration = 5 * 60 * 1000; // default 5 minutes
let lastStartTime = null; // used to resume correctly

// ------------------ FORMAT FUNCTION ------------------
function formatTime(totalMilliseconds) {
  if (totalMilliseconds < 0) totalMilliseconds = 0;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const milliseconds = String(Math.floor((totalMilliseconds % 1000) / 10)).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// ------------------ DISPLAY UPDATE ------------------
function updateDisplay() {
  timerDisplay.textContent = formatTime(elapsedMilliseconds);
}

// ------------------ START ------------------
startButton.addEventListener('click', () => {
  if (!isRunning) {
    isRunning = true;
    lastStartTime = Date.now();

    timer = setInterval(() => {
      const now = Date.now();
      const delta = now - lastStartTime;

      if (isStopwatchMode) {
        // Count up
        elapsedMilliseconds += delta;
      } else {
        // Count down
        elapsedMilliseconds -= delta;
        if (elapsedMilliseconds <= 0) {
          elapsedMilliseconds = 0;
          clearInterval(timer);
          isRunning = false;
          alert("Timer finished!");
        }
      }

      updateDisplay();
      lastStartTime = now; // update reference for smooth delta accumulation
    }, 10);
  }
});

// ------------------ STOP ------------------
stopButton.addEventListener('click', () => {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  }
});

// ------------------ RESET ------------------
resetButton.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  elapsedMilliseconds = isStopwatchMode ? 0 : countdownDuration;
  updateDisplay();
});

// ------------------ MODE TOGGLE ------------------
modeButton.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  isStopwatchMode = !isStopwatchMode;

  if (isStopwatchMode) {
    // Switch to stopwatch
    modeButton.textContent = "Timer";
    elapsedMilliseconds = 0;
  } else {
    // Switch to timer
    modeButton.textContent = "Stop watch";
    const minutes = prompt("⏱ Set timer duration (in minutes):", "0");
    countdownDuration = Math.max(0, Number(minutes)) * 60 * 1000 || 0;
    elapsedMilliseconds = countdownDuration;
  }

  updateDisplay();
});

// ------------------ INIT DISPLAY ------------------
elapsedMilliseconds = countdownDuration;
updateDisplay();





// ------------------ ADAFRUIT IO CONNECTION ------------------

// Replace with your Adafruit IO credentials
const USERNAME = "id";
const AIO_KEY = "mdp";

// Initialize the connection
const io = new AdafruitIO(USERNAME, AIO_KEY);


// Select the element that displays the shot count
const shotText = document.getElementById("shots");
const scoreText = document.getElementById("scored");

// Adjust the selector if necessary

setInterval( function(){
    io.getData("shots-feed", function(data) {
        console.log(data.json[0].value);
        shotText.innerHTML = data.json[0].value;

    })

        io.getData("score-feed", function(data) {
        console.log(data.json[0].value);
        scoreText.innerHTML = data.json[0].value;

    })



}, 2000)


// ------------------ REORDERABLE SECTIONS ------------------

const container = document.getElementById('reorderable-sections');
const sections = document.querySelectorAll('.reorderable');

// Make each section draggable
sections.forEach(section => {
  section.setAttribute('draggable', true);

  // Only allow drag when clicking the icon on the right
  const handle = section.querySelector('.icon-title');
  if (handle) {
    handle.style.cursor = 'grab';
    handle.addEventListener('mousedown', (e) => {
      section.classList.add('dragging');
      section.draggable = true;
    });
    handle.addEventListener('mouseup', (e) => {
      section.classList.remove('dragging');
    });
  }

  // Remove dragging class when drag ends
  section.addEventListener('dragend', () => {
    section.classList.remove('dragging');
  });
});

// Handle reordering logic
container.addEventListener('dragover', (e) => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  if (!dragging) return;

  const afterElement = getDragAfterElement(container, e.clientY);
  if (afterElement == null) {
    container.appendChild(dragging);
  } else {
    container.insertBefore(dragging, afterElement);
  }
});

// Helper to find the position of the dragged element
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.reorderable:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
