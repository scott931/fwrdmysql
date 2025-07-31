# AI Setup Guide for Forward Africa

## Overview

The Forward Africa platform includes an AI assistant called **Afrisage** that provides business guidance for African markets. This guide explains how to set up and use the AI functionality.

## Current Status

✅ **AI Assistant is Working!**

The AI is now functional with two modes:
1. **Real AI Mode** (with OpenAI API key)
2. **Fallback Mode** (hardcoded responses when API key is not available)

## Setup Options

### Option 1: Use Real AI (Recommended)

To enable the full AI experience with OpenAI:

1. **Get an OpenAI API Key**:
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key in your account settings
   - Copy the API key

2. **Add Environment Variable**:
   Create or update your `.env.local` file in the project root:
   ```bash
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

### Option 2: Use Fallback Mode (No Setup Required)

If you don't want to use OpenAI or don't have an API key, the AI will automatically use hardcoded responses that cover common African business topics.

## How to Access the AI

1. **Navigate to the AI Assistant**:
   - Go to `/afri-sage` in your browser
   - Or click "Afrisage" in the navigation menu

2. **Start a Conversation**:
   - Type your business question
   - The AI will respond with relevant advice
   - Try questions like:
     - "How to register a business in Kenya?"
     - "What are investment opportunities in East Africa?"
     - "Tell me about fintech regulations in South Africa"

## Features

### Real AI Mode (with OpenAI)
- **Dynamic responses** based on your specific questions
- **Context-aware** conversations
- **African business expertise** with up-to-date information
- **Professional tone** suitable for business users

### Fallback Mode (without OpenAI)
- **Pre-programmed responses** for common topics
- **Reliable performance** with no external dependencies
- **Covers key areas**:
  - Business registration in Kenya
  - Investment opportunities in Africa
  - Market insights across African countries
  - Legal and regulatory frameworks

## Troubleshooting

### Build Error: "Can't resolve 'openai'"
**Solution**: The openai package is already installed. If you still get this error:
```bash
npm install openai
```

### AI Not Responding
**Check**:
1. Is your development server running? (`npm run dev`)
2. Do you have an OpenAI API key in `.env.local`?
3. Check the browser console for error messages

### API Key Issues
**If you get OpenAI API errors**:
1. Verify your API key is correct
2. Check your OpenAI account has credits
3. The system will automatically fall back to hardcoded responses

## Testing the AI

Try these test questions to verify the AI is working:

1. **Basic Test**: "Hello, how can you help me?"
2. **Business Test**: "I want to start a business in Kenya"
3. **Investment Test**: "What are good investment opportunities in Africa?"
4. **Legal Test**: "What are the legal requirements for business in Nigeria?"

## Next Steps

The AI is now functional! You can:

1. **Test the current implementation** by visiting `/afri-sage`
2. **Add your OpenAI API key** for enhanced responses
3. **Customize the AI prompts** in `src/lib/aiService.ts`
4. **Extend the fallback responses** for more topics

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure the openai package is installed
4. The fallback mode should always work even if OpenAI fails