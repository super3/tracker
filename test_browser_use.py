import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the necessary classes from browser_use
from browser_use import Agent
from browser_use.browser.browser import Browser, BrowserConfig
from langchain_openai import ChatOpenAI

async def main():
    # Create a browser with headless mode disabled (to show the browser UI)
    browser_config = BrowserConfig(headless=False)
    browser = Browser(config=browser_config)
    
    # Create an agent with a specific task using LM Studio
    # LM Studio typically runs a local server that's compatible with OpenAI's API
    lm_studio = ChatOpenAI(
        base_url="http://localhost:1234/v1",  # Default LM Studio endpoint
        api_key="lm-studio",  # Can be any string when using LM Studio
        model="gemma-3-27b-it@q8_0"   # Using Gemma 3 27B Instruct model (quantized)
    )
    
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3 models and create a simple table with the pricing information",
        llm=lm_studio,
        browser=browser,
        enable_memory=False,  # Disable memory to avoid requiring OpenAI API for embeddings
        tool_calling_method='raw',  # Use raw mode for better compatibility with LLMs that don't support function calling
    )
    
    # Run the agent
    await agent.run()
    
    # Close the browser when done
    await browser.close()

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main()) 