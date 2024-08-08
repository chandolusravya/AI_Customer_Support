"use client";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  // all messages in the chat
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the Panora support assistant. How can I help you today?",},
  ]);
  const [message, setMessage] = useState(""); // User input
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return; // Don't send empty messages or if already sending
    setIsLoading(true);

    setMessage(""); // Clear input field
    setMessages((messages) => [
      ...messages,
      { "role": "user", "content": message }, // Add user message
      { "role": "assistant", "content": "" }, // Placeholder for the assistant's response
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { "role": "user", "content": message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader(); // Read the response as a stream
      const decoder = new TextDecoder(); // Decode the stream as text

      while (true) {
        // Read the stream until it's done
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true }); // Decode the chunk of text
        setMessages((messages) => {
          // Update the last message with the new text
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]; //taking the content of the last message and adding the generated text to the end of it
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  // Send message when Enter is pressed (without Shift)
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of the chat

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      overflow="hidden" // Prevent body scroll
    >
      <Stack
        direction={"column"}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
        overflow="hidden"
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
