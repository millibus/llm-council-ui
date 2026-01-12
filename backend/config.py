"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
COUNCIL_MODELS = [
    "x-ai/grok-4",
    "anthropic/claude-opus-4.5",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-haiku-4.5",
    "openai/gpt-5-thinking",
    "openai/gpt-5",
    "perplexity/sonar-pro",
    "google/gemini-3-flash",
    "google/gemini-3-pro",
    "microsoft/copilot",
]

# Mapping of model slugs to friendly names
MODEL_FRIENDLY_NAMES = {
    "x-ai/grok-4": "Grok 4.1",
    "anthropic/claude-opus-4.5": "Claude Opus 4.5",
    "anthropic/claude-sonnet-4.5": "Claude Sonnet 4.5",
    "anthropic/claude-haiku-4.5": "Claude Haiku 4.5",
    "openai/gpt-5-thinking": "ChatGPT 5.2 (Thinking)",
    "openai/gpt-5": "ChatGPT 5.2 (Fast)",
    "perplexity/sonar-pro": "Perplexity Pro",
    "google/gemini-3-flash": "Gemini 3 Flash",
    "google/gemini-3-pro": "Gemini 3 Pro",
    "microsoft/copilot": "Microsoft Copilot",
}

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = "google/gemini-3-pro"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
WINS_FILE = "data/wins.json"
