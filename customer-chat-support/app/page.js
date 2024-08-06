"use client"
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState } from "react"

export default function Home() {
  const [ messages, setMessages ] = useState([
    { role: 'assistant', content: `Hi! I'm the Headstarter support assistant. How can I help you today?`},
  ])
  return (
   <Box
    width = "100%"
    height = "100vh"
    display = "flex"
    flexDirection = "column"
    justifyContent = "center"
    alignItems= "center"
   >
    <Stack direction={'column'} width="500px" height="700px">
      <Stack direction={'column'} spacing={2}>
        {
          messages.map((message, index) => {
            <Box
            key={index}
            display="flex"
            justifyContent={
              message.role === "assisstance" ? "flex-start" : "flex-end"
            }
            >
              <Box
              bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
              color="white"
              borderRadius={16}
              p={2}
              >
                {message.content}
              </Box>
            </Box>
          })
        }
      </Stack>
      <Stack direction={'column'} spacing={2}>
        <TextField label="Message" fullWidth/>
        <Button variant="contained">Send</Button>
      </Stack>
    </Stack>
   </Box>
  );
}
