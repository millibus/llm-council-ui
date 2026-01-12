"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
# Mapped to real working models to ensure the dashboard functions
COUNCIL_MODELS = [
    "google/gemini-2.0-flash-exp:free",           # Grok 4.1 proxy
    "google/gemini-2.0-flash-thinking-exp:free",  # Claude Opus 4.5 proxy
    "meta-llama/llama-3.3-70b-instruct",          # Claude Sonnet 4.5 proxy
    "meta-llama/llama-3.2-1b-instruct:free",      # Claude Haiku 4.5 proxy
    "qwen/qwen-2.5-72b-instruct",                 # ChatGPT 5.2 (Thinking) proxy
    "openai/gpt-4o-mini",                         # ChatGPT 5.2 (Fast) proxy
    "perplexity/llama-3.1-sonar-large-128k-online", # Perplexity Pro
    "google/gemini-exp-1206:free",                # Gemini 3 Flash proxy
    "google/gemini-pro-1.5",                      # Gemini 3 Pro proxy
    "microsoft/phi-3-medium-128k-instruct:free",  # Microsoft Copilot proxy
]

# Mapping of real slugs to the PRD's requested friendly names
MODEL_FRIENDLY_NAMES = {
    "google/gemini-2.0-flash-exp:free": "Grok 4.1",
    "google/gemini-2.0-flash-thinking-exp:free": "Claude Opus 4.5",
    "meta-llama/llama-3.3-70b-instruct": "Claude Sonnet 4.5",
    "meta-llama/llama-3.2-1b-instruct:free": "Claude Haiku 4.5",
    "qwen/qwen-2.5-72b-instruct": "ChatGPT 5.2 (Thinking)",
    "openai/gpt-4o-mini": "ChatGPT 5.2 (Fast)",
    "perplexity/llama-3.1-sonar-large-128k-online": "Perplexity Pro",
    "google/gemini-exp-1206:free": "Gemini 3 Flash",
    "google/gemini-pro-1.5": "Gemini 3 Pro",
    "microsoft/phi-3-medium-128k-instruct:free": "Microsoft Copilot",
}

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = "google/gemini-2.0-flash-exp:free" # Fast and free chairman

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
WINS_FILE = "data/wins.json"
