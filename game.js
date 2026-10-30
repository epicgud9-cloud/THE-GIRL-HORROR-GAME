"use strict";

/*
 * THE GIRL — beginner-friendly browser horror prototype
 * - 50 question prompts, selected randomly from a progression-based pool
 * - A random playthrough lasts 20–50 questions
 * - Repeated prompts can trigger the "Why did you change your mind?" response
 * - Progress and recognized text are saved in localStorage
 * - Optional camera ending uses local frame-difference motion detection only
 */

const STORAGE_KEY = "theGirl_progress_v1";
const CAMERA_KEY = "theGirl_camera_opt_in_v1";

const QUESTION_BANK = [
  // PHASE 1 — ordinary questions (1–15)
  { id: "q01", phase: "early", text: "What's your favourite colour?" },
  { id: "q02", phase: "early", text: "What's your favourite snack?" },
  { id: "q03", phase: "early", text: "Do you prefer sunny days or rainy days?" },
  { id: "q04", phase: "early", text: "What's an animal you really like?" },
  { id: "q05", phase: "early", text: "What kind of music do you enjoy?" },
  { id: "q06", phase: "early", text: "Do you like drawing or painting?" },
  { id: "q07", phase: "early", text: "What's your favourite season?" },
  { id: "q08", phase: "early", text: "Are you more awake in the morning or at night?" },
  { id: "q09", phase: "early", text: "What's a game you enjoy playing?" },
  { id: "q10", phase: "early", text: "Do you enjoy listening to stories?" },
  { id: "q11", phase: "early", text: "What do you like doing when it rains?" },
  { id: "q12", phase: "early", text: "Do you like quiet places?" },
  { id: "q13", phase: "early", text: "What's a sound that makes you feel calm?" },
  { id: "q14", phase: "early", text: "Would you rather visit a forest or a beach?" },
  { id: "q15", phase: "early", text: "Do you prefer reading or watching films?" },

  // PHASE 2 — questions become more personal and unusual (16–35)
  { id: "q16", phase: "middle", text: "Do you remember most of your dreams?" },
  { id: "q17", phase: "middle", text: "Do you ever talk to yourself when you're thinking?" },
  { id: "q18", phase: "middle", text: "Do you like being in a room by yourself?" },
  { id: "q19", phase: "middle", text: "Have you ever thought you heard someone call your name?" },
  { id: "q20", phase: "middle", text: "Do you notice when someone suddenly goes quiet?" },
  { id: "q21", phase: "middle", text: "Would you tell me if I asked you the same question twice?" },
  { id: "q22", phase: "middle", text: "Do you think people change their minds often?" },
  { id: "q23", phase: "middle", text: "Have you ever pretended to like something?" },
  { id: "q24", phase: "middle", text: "Do you think I've asked you too many questions?" },
  { id: "q25", phase: "middle", text: "Did you hear anything just now?" },
  { id: "q26", phase: "middle", text: "Are you looking at my face?" },
  { id: "q27", phase: "middle", text: "Do you think my face looks different from before?" },
  { id: "q28", phase: "middle", text: "If I stopped talking, would you wait?" },
  { id: "q29", phase: "middle", text: "Do you think I remember every answer?" },
  { id: "q30", phase: "middle", text: "Would you notice if I stopped smiling?" },
  { id: "q31", phase: "middle", text: "Do you think I can tell when someone is lying?" },
  { id: "q32", phase: "middle", text: "Have I asked you this before?" },
  { id: "q33", phase: "middle", text: "Why did you take so long to answer?" },
  { id: "q34", phase: "middle", text: "Did you look away from the screen?" },
  { id: "q35", phase: "middle", text: "Are you still listening to me?" },

  // PHASE 3 — openly unsettling questions (36–50)
  { id: "q36", phase: "late", text: "Do you think I'm alone in here?" },
  { id: "q37", phase: "late", text: "Is the room behind you dark?" },
  { id: "q38", phase: "late", text: "Did you check whether I was still here?" },
  { id: "q39", phase: "late", text: "Why did you come back to the website?" },
  { id: "q40", phase: "late", text: "Would you recognize me in a different picture?" },
  { id: "q41", phase: "late", text: "Do you think I can see you?" },
  { id: "q42", phase: "late", text: "Why are you looking at the screen instead of me?" },
  { id: "q43", phase: "late", text: "Have you noticed my face changing?" },
  { id: "q44", phase: "late", text: "Do you remember what I looked like at the beginning?" },
  { id: "q45", phase: "late", text: "Do you think I look happier now?" },
  { id: "q46", phase: "late", text: "Are you going to leave before we finish?" },
  { id: "q47", phase: "late", text: "Would you close this page if I asked you to?" },
  { id: "q48", phase: "late", text: "Can you promise not to forget me?" },
  { id: "q49", phase: "late", text: "Do you think we're nearly finished?" },
  { id: "q50", phase: "late", text: "Can you look at me one last time?" }
];

const NORMAL_REPLIES = [
  "I see.",
  "That's interesting.",
  "Okay. Thank you.",
  "I like hearing your answers.",
  "I understand."
];

const elements = {
  welcome: document.getElementById("welcomeScreen"),
  game: document.getElementById("gameScreen"),
  ending: document.getElementById("endingScreen"),
  jump: document.getElementById("jumpScreen"),
  start: document.getElementById("startButton"),
  reset: document.getElementById("resetButton"),
  consent: document.getElementById("cameraConsent"),
  checkCamera: document.getElementById("checkCameraButton"),
  cameraStatus: document.getElementById("cameraStatus"),
  progress: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
  portrait: document.getElementById("portrait"),
  question: document.getElementById("questionText"),
  reply: document.getElementById("replyText"),
  status: document.getElementById("statusText"),
  listen: document.getElementById("listenButton"),
  typed: document.getElementById("typedAnswer"),
  send: document.getElementById("sendButton"),
  repeat: document.getElementById("repeatButton"),
  endingText: document.getElementById("endingText"),
  backToStart: document.getElementById("backToStartButton")
};

let gameState = null;
let speechRecognition = null;
let isListening = false;
let endingTimer = null;
let cameraStream = null;
let endingMotionTimer = null;

function readSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Could not read saved conversation:", error);
    return null;
  }
}

function saveState() {
  try {
    if (gameState) localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.warn("Could not save conversation:", error);
    setStatus("This browser couldn't save progress. Keep this tab open if you want to continue.");
  }
}

function getCameraConsent() {
  return localStorage.getItem(CAMERA_KEY) === "yes";
}

function setCameraConsent(enabled) {
  if (enabled) localStorage.setItem(CAMERA_KEY, "yes");
  else localStorage.removeItem(CAMERA_KEY);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseNextQuestion() {
  const progress = gameState.asked / gameState.total;
  let phase = "early";
  if (progress >= 0.68) phase = "late";
  else if (progress >= 0.30) phase = "middle";

  const pool = QUESTION_BANK.filter((question) => question.phase === phase);
  return pool[randomInteger(0, pool.length - 1)];
}

function questionById(id) {
  return QUESTION_BANK.find((question) => question.id === id);
}

function setStatus(message) {
  elements.status.textContent = message;
}

function showScreen(screen) {
  elements.welcome.hidden = screen !== "welcome";
  elements.game.hidden = screen !== "game";
  elements.ending.hidden = screen !== "ending";
  elements.jump.hidden = screen !== "jump";
}

function speak(text, afterSpeaking) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    if (typeof afterSpeaking === "function") afterSpeaking();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.pitch = 0.82;
  utterance.volume = 0.82;

  let finished = false;
  const finishOnce = () => {
    if (finished) return;
    finished = true;
    if (typeof afterSpeaking === "function") afterSpeaking();
  };
  utterance.onend = finishOnce;
  utterance.onerror = finishOnce;

  try {
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn("Speech synthesis unavailable:", error);
    finishOnce();
  }
}

function stopSpeechAndRecognition() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (speechRecognition && isListening) {
    try { speechRecognition.abort(); } catch (error) { /* It may already be stopped. */ }
  }
  isListening = false;
  elements.listen.classList.remove("is-listening");
  elements.listen.disabled = false;
}

function renderQuestion(shouldSpeak = false) {
  const question = questionById(gameState.currentQuestionId);
  if (!question) {
    gameState.currentQuestionId = chooseNextQuestion().id;
    saveState();
    return renderQuestion(shouldSpeak);
  }

  elements.question.textContent = question.text;
  elements.reply.hidden = true;
  elements.reply.textContent = "";
  elements.progress.textContent = `Question ${gameState.asked + 1} of ${gameState.total}`;
  elements.progressFill.style.width = `${(gameState.asked / gameState.total) * 100}%`;

  const progress = gameState.asked / gameState.total;
  const brightness = 0.20 + (0.77 * progress);
  const blur = 2.2 * (1 - progress);
  elements.portrait.style.filter = `brightness(${brightness.toFixed(2)}) blur(${blur.toFixed(2)}px)`;
  elements.portrait.classList.toggle("disappointed", Boolean(gameState.disappointed));

  setStatus("Press the microphone button when you're ready, or type below.");
  if (shouldSpeak) speak(question.text);
}

function startNewGame() {
  gameState = {
    total: randomInteger(20, 50),
    asked: 0,
    currentQuestionId: null,
    answersByQuestion: {},
    history: [],
    disappointed: false,
    endingArmed: false
  };
  gameState.currentQuestionId = chooseNextQuestion().id;
  saveState();
  showScreen("game");
  renderQuestion(true);
}

function startOrResume() {
  const saved = readSavedState();
  if (saved && saved.endingArmed) {
    playReturnDialogue();
    return;
  }

  if (saved && !saved.endingArmed && saved.asked < saved.total) {
    gameState = saved;
    showScreen("game");
    renderQuestion(true);
    return;
  }

  startNewGame();
}

function normalizeAnswer(answer) {
  return answer.toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function submitAnswer(rawAnswer) {
  if (!gameState || gameState.endingArmed) return;
  const answer = String(rawAnswer || "").trim();
  if (!answer) {
    setStatus("I didn't hear an answer. Try again, or type one.");
    return;
  }

  stopSpeechAndRecognition();
  elements.typed.value = "";
  const question = questionById(gameState.currentQuestionId);
  if (!question) return;

  const previous = gameState.answersByQuestion[question.id];
  const changedMind = Boolean(previous && normalizeAnswer(previous.first) !== normalizeAnswer(answer));

  if (!previous) {
    gameState.answersByQuestion[question.id] = { first: answer, last: answer, count: 1 };
  } else {
    previous.last = answer;
    previous.count += 1;
  }

  gameState.history.push({ questionId: question.id, answer, at: Date.now() });
  gameState.asked += 1;
  if (changedMind) gameState.disappointed = true;
  saveState();

  if (gameState.asked >= gameState.total) {
    elements.progress.textContent = `Question ${gameState.total} of ${gameState.total}`;
    elements.progressFill.style.width = "100%";
    setStatus(" ");
    setTimeout(beginEnding, 650);
    return;
  }

  const nextQuestion = chooseNextQuestion();
  gameState.currentQuestionId = nextQuestion.id;
  saveState();
  const reply = changedMind ? "Why did you change your mind?" : NORMAL_REPLIES[randomInteger(0, NORMAL_REPLIES.length - 1)];
  elements.reply.textContent = reply;
  elements.reply.hidden = false;
  elements.portrait.classList.toggle("disappointed", Boolean(gameState.disappointed));
  elements.progress.textContent = `Question ${gameState.asked + 1} of ${gameState.total}`;
  elements.progressFill.style.width = `${(gameState.asked / gameState.total) * 100}%`;
  setStatus(" ");

  speak(reply, () => {
    renderQuestion(false);
    speak(nextQuestion.text);
  });
}

function startListening() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setStatus("Speech recognition isn't available here. Please type your answer instead.");
    return;
  }
  if (isListening) return;

  try {
    speechRecognition = new Recognition();
    speechRecognition.lang = "en-US";
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = () => {
      isListening = true;
      elements.listen.classList.add("is-listening");
      elements.listen.disabled = true;
      setStatus("Listening… speak naturally, then pause.");
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      submitAnswer(transcript);
    };

    speechRecognition.onerror = (event) => {
      isListening = false;
      elements.listen.classList.remove("is-listening");
      elements.listen.disabled = false;
      const messages = {
        "not-allowed": "Microphone permission was blocked. You can type your answer instead.",
        "audio-capture": "Chrome couldn't find a working microphone. You can type instead.",
        "network": "Speech recognition needs a network connection. You can type instead.",
        "no-speech": "I didn't hear anything. Try again or type instead."
      };
      setStatus(messages[event.error] || "The microphone stopped. Try again or type instead.");
    };

    speechRecognition.onend = () => {
      isListening = false;
      elements.listen.classList.remove("is-listening");
      elements.listen.disabled = false;
    };

    speechRecognition.start();
  } catch (error) {
    isListening = false;
    elements.listen.classList.remove("is-listening");
    elements.listen.disabled = false;
    setStatus("Chrome couldn't start the microphone. Try again or type instead.");
  }
}

async function checkCameraPermission() {
  if (!elements.consent.checked) {
    setCameraConsent(false);
    elements.cameraStatus.textContent = "Camera remains off. The no-camera ending will be used.";
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    elements.cameraStatus.textContent = "Camera access isn't available here. The no-camera ending will be used.";
    setCameraConsent(false);
    elements.consent.checked = false;
    return;
  }

  elements.checkCamera.disabled = true;
  elements.cameraStatus.textContent = "Chrome is asking for camera permission…";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    stream.getTracks().forEach((track) => track.stop());
    setCameraConsent(true);
    elements.cameraStatus.textContent = "Camera permission granted. It will only be used during the final scene.";
  } catch (error) {
    setCameraConsent(false);
    elements.consent.checked = false;
    elements.cameraStatus.textContent = "Camera wasn't enabled. The no-camera ending will be used.";
  } finally {
    elements.checkCamera.disabled = false;
  }
}

function beginEnding() {
  stopSpeechAndRecognition();
  if (!gameState) return;
  gameState.endingArmed = true;
  saveState();
  showScreen("ending");
  elements.endingText.textContent = "";
  document.body.classList.add("ending-active");
  endingTimer = setTimeout(() => {
    if (getCameraConsent()) runCameraEnding();
    else triggerJumpscare();
  }, 850);
}

function playReturnDialogue() {
  gameState = readSavedState();
  stopSpeechAndRecognition();
  showScreen("ending");
  document.body.classList.add("ending-active");
  elements.endingText.textContent = "Why were you so scared?\nAll I wanted to do is look at you.";
  const line = "Why were you so scared? All I wanted to do is look at you.";
  setTimeout(() => speak(line, triggerJumpscare), 500);
}

function stopCameraStream() {
  if (endingMotionTimer) {
    clearTimeout(endingMotionTimer);
    endingMotionTimer = null;
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  const video = document.getElementById("endingCameraVideo");
  if (video) video.remove();
}

async function runCameraEnding() {
  elements.endingText.textContent = "LOOK BEHIND YOU";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    triggerJumpscare();
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 160 }, height: { ideal: 120 } },
      audio: false
    });

    const video = document.createElement("video");
    video.id = "endingCameraVideo";
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.position = "fixed";
    video.style.left = "-10000px";
    video.style.width = "80px";
    video.style.height = "60px";
    document.body.appendChild(video);
    video.srcObject = cameraStream;
    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 36;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let previousFrame = null;
    let motionEvents = 0;
    let motionActive = false;
    let quietSamples = 0;
    let startedAt = Date.now();
    let samples = 0;

    // Give the camera a moment to settle, then compare tiny grayscale frames locally.
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const sample = () => {
      if (!cameraStream || !video.isConnected) return;
      if (video.readyState < 2) {
        endingMotionTimer = setTimeout(sample, 220);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const currentFrame = new Uint8Array(canvas.width * canvas.height);
      for (let pixel = 0, dataIndex = 0; pixel < currentFrame.length; pixel += 1, dataIndex += 4) {
        currentFrame[pixel] = Math.round((rgba[dataIndex] + rgba[dataIndex + 1] + rgba[dataIndex + 2]) / 3);
      }

      if (previousFrame) {
        let difference = 0;
        for (let index = 0; index < currentFrame.length; index += 1) {
          difference += Math.abs(currentFrame[index] - previousFrame[index]);
        }
        const averageDifference = difference / currentFrame.length;

        if (averageDifference > 12 && !motionActive) {
          motionActive = true;
          motionEvents += 1;
          elements.endingText.textContent = motionEvents >= 2 ? "..." : "LOOK BEHIND YOU";
          if (motionEvents >= 2) {
            triggerJumpscare();
            return;
          }
        }

        if (motionActive && averageDifference < 5) {
          quietSamples += 1;
          if (quietSamples >= 3) {
            motionActive = false;
            quietSamples = 0;
          }
        } else if (averageDifference >= 5) {
          quietSamples = 0;
        }
      }

      previousFrame = currentFrame;
      samples += 1;

      // Avoid leaving the camera running forever if movement isn't detected.
      if (Date.now() - startedAt > 18000 || samples > 100) {
        triggerJumpscare();
        return;
      }
      endingMotionTimer = setTimeout(sample, 220);
    };

    sample();
  } catch (error) {
    // If the player has no camera or permission is unavailable, use the direct ending.
    triggerJumpscare();
  }
}

function triggerJumpscare() {
  if (endingTimer) {
    clearTimeout(endingTimer);
    endingTimer = null;
  }
  stopCameraStream();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  showScreen("jump");
  document.body.classList.remove("ending-active");
  // Completing the conversation clears its saved answers, as the story's memory ends here.
  try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* Storage may be unavailable. */ }
  setTimeout(() => { elements.backToStart.hidden = false; }, 2400);
}

function returnToBeginning() {
  stopCameraStream();
  document.body.classList.remove("ending-active");
  gameState = null;
  elements.backToStart.hidden = true;
  showScreen("welcome");
  updateWelcomeState();
}

function updateWelcomeState() {
  const saved = readSavedState();
  if (saved && saved.endingArmed) {
    elements.start.textContent = "Return to the conversation";
    elements.reset.hidden = false;
  } else if (saved && saved.asked < saved.total) {
    elements.start.textContent = "Continue conversation";
    elements.reset.hidden = false;
  } else {
    elements.start.textContent = "Start conversation";
    elements.reset.hidden = true;
  }

  const cameraEnabled = getCameraConsent();
  elements.consent.checked = cameraEnabled;
  if (cameraEnabled) {
    elements.cameraStatus.textContent = "Camera ending enabled. It will only be requested during the final scene.";
  }
}

function resetConversation() {
  const confirmReset = window.confirm("Forget the saved answers and start a completely new conversation?");
  if (!confirmReset) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* Ignore unavailable storage. */ }
  gameState = null;
  updateWelcomeState();
}

// Button events are attached after the page has loaded because this script uses defer.
elements.start.addEventListener("click", startOrResume);
elements.reset.addEventListener("click", resetConversation);
elements.checkCamera.addEventListener("click", checkCameraPermission);
elements.consent.addEventListener("change", () => {
  if (!elements.consent.checked) {
    setCameraConsent(false);
    elements.cameraStatus.textContent = "Camera disabled. The no-camera ending will be used.";
  } else {
    elements.cameraStatus.textContent = "Click 'Check camera permission' to enable the optional camera ending.";
  }
});
elements.listen.addEventListener("click", startListening);
elements.send.addEventListener("click", () => submitAnswer(elements.typed.value));
elements.typed.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitAnswer(elements.typed.value);
});
elements.repeat.addEventListener("click", () => {
  if (!gameState) return;
  const question = questionById(gameState.currentQuestionId);
  if (question) speak(question.text);
});
elements.backToStart.addEventListener("click", returnToBeginning);

// Resume correctly if the player returns after finishing the questions but before the scare.
(function initialize() {
  const saved = readSavedState();
  updateWelcomeState();
  if (saved && saved.endingArmed) {
    playReturnDialogue();
  }
})();

window.addEventListener("pagehide", stopCameraStream);
