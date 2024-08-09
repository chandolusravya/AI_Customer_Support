"use client";
import {
  Box,
  Stack,
  TextField,
  Link,
  Typography,
  Popover,
  Button,
  Divider,
} from "@mui/material";
import { useState, useRef, useEffect, use } from "react";
import { Fab } from "@mui/material";
import { IoArrowUp } from "react-icons/io5";
import ReactMarkdown from "react-markdown"; //to render markdown in the assistant's responses
import remarkGfm from "remark-gfm"; //to enable GitHub Flavored Markdown

export default function Home() {
  // all messages in the chat
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(""); // User input
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for the popover
  const popoverOpen = Boolean(anchorEl); // Check if the popover is open
  const [selectedAI, setSelectedAI] = useState("Choose AI");
  const [useOpenAI, setUseOpenAI] = useState(false);
  const greetingMessage = {
    role: "assistant",
    content:
      "Hi! I'm PanoraBot. How can I help you today? You can ask me anything about Panora or chat with me to see how I can assist you.",
  };

  const handleChooseAI = (event) => {
    //open the popover
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    //close the popover
    setAnchorEl(null);
  };

  const handleSelectOpenAI = () => {
    setSelectedAI("Open AI");
    setUseOpenAI(true);
    handleClose();
  };

  const handleSelectClaude3 = () => {
    setSelectedAI("Claude 3");
    setUseOpenAI(false);
    handleClose();
  };

  useEffect(() => {
    // Initialize messages with the greeting
    setMessages([greetingMessage]);
  }, []);

  const sendMessage = async () => {
    const route = useOpenAI ? "/api/openai" : "/api/claude3";

    if (!message.trim() || isLoading) return; // Don't send empty messages or if already sending
    setIsLoading(true);

    const newUserMessage = { role: "user", content: message };
    setMessage("");
    // Add the new user message to the messages
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    let messagesToSend;
    if (useOpenAI) {
      messagesToSend = messages;
    } else {
      // For Claude 3, ensure alternating user/assistant messages
      messagesToSend = messages.reduce((acc, msg, index) => {
        if (index === 0 && msg.role === "assistant") {
          // Skip the initial greeting if it's from the assistant
          return acc;
        }
        if (index === 0 || msg.role === "user") {
          acc.push(msg);
          // If this is a user message and not the last one, add the next assistant message
          if (
            index < messages.length - 1 &&
            messages[index + 1].role === "assistant"
          ) {
            acc.push(messages[index + 1]); // Add the next assistant message
          }
        }
        return acc;
      }, []);
    }

    try {
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messagesToSend, newUserMessage]),
      });
      console.log("Using", useOpenAI ? "Open AI" : "Claude 3");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader(); // Read the response as a stream
      const decoder = new TextDecoder(); // Decode the stream as text
      let assistantResponse = { role: "assistant", content: "" };

      // Add an empty assistant message that we'll update as we receive the stream
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);

      while (true) {
        // Read the stream until it's done
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true }); // Decode the chunk of text
        assistantResponse.content += text;
        // Update the last message (which is the assistant's response)
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { ...assistantResponse },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
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
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "background.main",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mt: 2,
          mb: 2,
          fontWeight: "bold",
          transform: "translateZ(0)",
          transition: "transform 0.4s ease-out",
          "&:hover": {
            transform: "translateY(-5px) translateZ(0)",
          },
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        Panora Chatbot{" "}
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleChooseAI}>
        {selectedAI}
      </Button>
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button sx={{ p: 2, borderRadius: 0 }} onClick={handleSelectOpenAI}>
            Open AI
          </Button>
          <Divider />
          <Button sx={{ p: 2, borderRadius: 0 }} onClick={handleSelectClaude3}>
            Claude 3
          </Button>
        </Box>
      </Popover>
      <Stack
        sx={{
          direction: "column",
          borderRadius: 4,
          width: { md: "95vw", sm: "90vw", xs: "90vw" },
          height: "90vh",
          border: "1px solid",
          borderColor: "dark.main",
          p: { xs: 1, sm: 2 },
          spacing: 3,
          overflow: "hidden",
          mb: 2,
        }}
      >
        <Stack
          direction="column"
          spacing={3}
          sx={{
            overflow: "auto",
            maxHeight: "100%",
            flexGrow: 1,
            scrollbarWidth: "thin",
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{ display: "flex", mb: 2 }}
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "secondary.main"
                    : "primary.main"
                }
                color={message.role === "assistant" ? "black" : "white"}
                borderRadius={3}
                p={{ xs: 1.5, sm: 2 }}
                maxWidth={{ xs: "80%", sm: "70%", md: "60%" }}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown //assistant's messages can contain markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      //styling the markdown returned by our ai chatbot messages
                      p: ({ node, ...props }) => (
                        <Typography variant="body1" gutterBottom {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <Typography variant="h5" gutterBottom {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <Typography variant="h6" gutterBottom {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          style={{ paddingLeft: "20px", margin: "10px 0" }}
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          style={{ paddingLeft: "20px", margin: "10px 0" }}
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li style={{ margin: "5px 0" }} {...props} />
                      ),
                      a: (
                        { node, ...props } //handle how links are rendered
                      ) => (
                        <Link
                          href={props.href}
                          target="_blank" //this and the next line make the link open in a new tab
                          rel="noopener noreferrer"
                          color="tertiary.main"
                          variant="body1"
                          sx={{
                            textDecoration: "underline",
                          }}
                        >
                          {props.children}
                        </Link>
                      ),
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <Typography
                            component="code"
                            variant="body2"
                            sx={{
                              bgcolor: "grey.300",
                              p: 0.5,
                              borderRadius: 1,
                            }}
                            {...props}
                          />
                        ) : (
                          <Box
                            component="pre"
                            sx={{
                              bgcolor: "grey.300",
                              p: 1,
                              borderRadius: 2,
                              overflowX: "auto",
                            }}
                          >
                            <Typography
                              component="code"
                              variant="body2"
                              color="dark.main"
                              {...props}
                            />
                          </Box>
                        ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <Typography variant="body1">{message.content}</Typography>
                )}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} /> {/* Scroll to this div */}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 1, position: "relative" }}>
          <TextField
            placeholder="Message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            multiline
          />
          <Fab
            color="primary"
            aria-label="send"
            onClick={sendMessage}
            disabled={isLoading || !message.trim()} //make the button disabled if the message is empty or if it's already sending
            size="small"
            sx={{
              position: "absolute", //need it to be absolute to be able to position it inside of the text field
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10, //to make sure it's above the text field
            }}
          >
            <IoArrowUp size={20} />
          </Fab>
        </Stack>
      </Stack>
    </Box>
  );
}
