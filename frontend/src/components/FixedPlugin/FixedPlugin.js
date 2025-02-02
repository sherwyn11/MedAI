import React, { useState, useEffect, useRef } from "react";

function FixedPlugin() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const chatWindowStyle = {
    position: "fixed",
    bottom: "70px", // Keeps space for the button above
    right: "20px",
    width: "350px", // Increased the width of the chat window
    height: "450px", // Adjusted the height slightly
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    overflow: "hidden", // To make sure no content goes outside
    zIndex: 999, // Ensure it stays above other content
  };

  const messagesStyle = {
    flexGrow: "1",
    overflowY: "auto",
    padding: "10px",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column", // Change from column-reverse to column
  };

  const userMsgStyle = {
    backgroundColor: "#d1f7c4",
    padding: "8px",
    margin: "5px 0",
    borderRadius: "10px",
    alignSelf: "flex-end", // Right-aligned for user
    maxWidth: "80%",
    wordWrap: "break-word", // Ensures long words don't overflow
  };

  const botMsgStyle = {
    backgroundColor: "#f1f1f1",
    padding: "8px",
    margin: "5px 0",
    borderRadius: "10px",
    alignSelf: "flex-start", // Left-aligned for bot
    maxWidth: "80%",
    wordWrap: "break-word", // Ensures long words don't overflow
    marginTop: "5px", // Ensure bot's message is below the user's message
  };

  const inputAreaStyle = {
    display: "flex",
    padding: "10px",
    backgroundColor: "#f7f7f7",
    borderTop: "1px solid #ddd",
  };

  const inputStyle = {
    flexGrow: "1",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginRight: "10px",
  };

  const sendButtonStyle = {
    padding: "8px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      setMessages([...messages, { sender: "user", text: userInput }]);
      setUserInput("");
      setIsTyping(true); // Show typing indicator for the bot

      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      setIsTyping(false); // Hide typing indicator after receiving bot's response
      setMessages([...messages, { sender: "user", text: userInput }, ...data]);
    }
  };

  const renderButtons = (buttons) => {
    return buttons.map((button, idx) => (
      <button
        key={idx}
        onClick={() => setUserInput(button.payload)} // Set payload on button click
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "5px",
          width: "100%",
        }}
      >
        {button.title}
      </button>
    ));
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <button
        onClick={handleToggle}
        style={{
          position: "fixed",
          bottom: "20px", // Stick to bottom-right
          right: "20px", // Stick to right edge
          maxWidth: "100%",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "50px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          zIndex: 1000, // Ensure the button is on top of other elements
        }}
      >
        {isOpen ? "Close Chat" : "Chat with us"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={messagesStyle}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={msg.sender === "user" ? userMsgStyle : botMsgStyle}
              >
                {msg.text?.split("\n")?.map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
                {msg.buttons && renderButtons(msg.buttons)}{" "}
                {/* Render buttons if present */}
              </div>
            ))}
            {isTyping && (
              <div
                style={{
                  backgroundColor: "#f1f1f1",
                  padding: "8px",
                  margin: "5px 0",
                  borderRadius: "10px",
                  alignSelf: "flex-start",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                  marginTop: "5px",
                  display: "inline-block",
                }}
              >
                <span className="typing-indicator">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={inputAreaStyle}>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="Type a message"
            />
            <button onClick={handleSendMessage} style={sendButtonStyle}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FixedPlugin;
