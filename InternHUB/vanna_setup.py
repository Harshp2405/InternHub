"""
vanna_setup.py
==============
Core setup module for the InternHub Text-to-SQL chatbot.

Using Vanna 2.0 (Agentic Framework) Legacy Adapter for compatibility.
"""

import os
import logging
from dotenv import load_dotenv
from groq import Groq

# Vanna 2.0 (Legacy) imports - in 2.x these are moved to .legacy
from vanna.legacy.chromadb import ChromaDB_VectorStore
from vanna.legacy.base import VannaBase

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

class InternHubVanna(ChromaDB_VectorStore, VannaBase):
    """
    Custom Vanna implementation for InternHub.
    Inherits from ChromaDB_VectorStore and VannaBase (Legacy 2.0 API).
    """

    def __init__(self, config: dict | None = None):
        config = config or {}
        
        # Groq Setup
        self._groq_api_key = config.get("groq_api_key") or os.getenv("GROQ_API_KEY")
        self._groq_model   = config.get("groq_model")   or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        if not self._groq_api_key:
            raise EnvironmentError("GROQ_API_KEY is not set.")

        self._groq_client = Groq(api_key=self._groq_api_key)

        # ChromaDB Setup
        chroma_path = config.get("chroma_path") or os.getenv("CHROMA_PATH", "./chroma_db")
        config["path"] = chroma_path

        # Initialise parents
        ChromaDB_VectorStore.__init__(self, config=config)
        VannaBase.__init__(self, config=config)

        logger.info(f"InternHubVanna initialised | model={self._groq_model}")

    def system_message(self, message: str) -> dict: return {"role": "system", "content": message}
    def user_message(self, message: str) -> dict: return {"role": "user", "content": message}
    def assistant_message(self, message: str) -> dict: return {"role": "assistant", "content": message}

    def submit_prompt(self, prompt, **kwargs) -> str:
        """Override to use Groq API."""
        if prompt is None:
            raise ValueError("Prompt is None")

        logger.info(f"Submitting prompt to Groq model: {self._groq_model}")

        response = self._groq_client.chat.completions.create(
            model=self._groq_model,
            messages=prompt,
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content

# Singleton instance
_vanna_config = {
    "groq_api_key": os.getenv("GROQ_API_KEY"),
    "groq_model":   os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    "chroma_path":  os.getenv("CHROMA_PATH", "./chroma_db"),
    "allow_llm_to_see_data": True,
}

vn = InternHubVanna(config=_vanna_config)

def connect_to_postgres() -> None:
    """Connect Vanna instance to Postgres."""
    host     = os.getenv("DB_HOST",     "ep-calm-pine-a7k7ot0m-pooler.ap-southeast-2.aws.neon.tech")
    port     = int(os.getenv("DB_PORT", "5432"))
    dbname   = os.getenv("DB_NAME",     "HasuraDb")
    user     = os.getenv("DB_USER",     "neondb_owner")
    password = os.getenv("DB_PASSWORD", "npg_b0TWL4fKGFnY")

    logger.info(f"Connecting to Postgres db: {dbname} at {host}:{port}")
    vn.connect_to_postgres(
        host=host,
        dbname=dbname,
        user=user,
        password=password,
        port=port,
        sslmode="require",
    )
    logger.info("Successfully connected to PostgreSQL")
