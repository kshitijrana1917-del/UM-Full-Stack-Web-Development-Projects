const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const themeToggle = document.getElementById("themeToggle");
const sendSound = document.getElementById("sendSound");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  sendSound.play();
  navigator.vibrate?.(100);
  userInput.value = "";

  showTyping();
  setTimeout(() => {
    removeTyping();
    appendMessage(getBotReply(message), "bot");
  }, 1400);
}

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender, "fade-in");

  msg.innerHTML = `<span>${text}</span>
  <div class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("typing");
  typingDiv.id = "typing";
  typingDiv.innerHTML = `<div class="dot-typing"></div><div class="dot-typing"></div><div class="dot-typing"></div>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typingDiv = document.getElementById("typing");
  if (typingDiv) typingDiv.remove();
}

function getBotReply(input) {
  const msg = input.toLowerCase();
  if (msg.includes("hello")) return "Hello there! 😊 How’s your day going?";
  if (msg.includes("how are you")) return "Feeling fantastic! ⚡ Thanks for asking.";
  if (msg.includes("your name")) return "I’m <b>ChatWave</b> 🌊 — your friendly AI companion.";
  if (msg.includes("joke")) return "Why don’t programmers like nature? 🌳 Too many bugs! 😂";
  if (msg.includes("time")) return `⏰ It's ${new Date().toLocaleTimeString()}.`;
  if (msg.includes("date")) return `📅 Today’s date is ${new Date().toLocaleDateString()}.`;
  if (msg.includes("bye")) return "Goodbye 👋 Have an awesome day ahead!";
  return "🤔 Hmm, that’s interesting! Tell me more...";
}
