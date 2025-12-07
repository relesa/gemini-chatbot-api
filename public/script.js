document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  /**
   * Creates and appends a message element to the chat box.
   * @param {string} text - The message text
   * @param {string} sender - Either "user" or "bot"
   * @returns {HTMLElement} The created message element
   */
  const addMessage = (text, sender = "user") => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = text;

    // Fade-in animation
    messageElement.style.opacity = 0;
    messageElement.style.transform = "translateY(10px)";

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Trigger animation
    setTimeout(() => {
      messageElement.style.opacity = 1;
      messageElement.style.transform = "translateY(0)";
    }, 10);

    return messageElement;
  };

  /**
   * Handles form submission: sends user message to backend and displays response.
   */
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get and validate user input
    const userMessageText = userInput.value.trim();
    if (!userMessageText) return;

    // Display user message immediately
    addMessage(userMessageText, "user");
    userInput.value = "";

    // Create placeholder for bot response
    const botMessageElement = addMessage("Thinking...", "bot");
    botMessageElement.classList.add("typing");

    try {
      // Send message to backend API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [{ role: "user", content: userMessageText }],
        }),
      });

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const data = await response.json();

      // Remove loading state
      botMessageElement.classList.remove("typing");

      // Update message with AI response or error message
      if (data && data.result) {
        botMessageElement.textContent = data.result;
      } else {
        botMessageElement.textContent = "Sorry, no response received.";
      }
    } catch (error) {
      // Log error for debugging
      console.error("Error fetching response:", error);

      // Remove loading state and show error message
      botMessageElement.classList.remove("typing");
      botMessageElement.textContent = "Failed to get response from server.";
    }

    // Auto-scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  /**
   * Allow Enter key to submit form (Shift+Enter for new line).
   */
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });
});
