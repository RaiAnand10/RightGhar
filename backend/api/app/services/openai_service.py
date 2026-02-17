from openai import AzureOpenAI
from cachetools import TTLCache
from typing import List, Dict, Tuple
import logging
import json

from app.config import settings
from app.services.data_loader import DataLoader

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for handling Azure OpenAI chat completions for RightGhar."""

    SYSTEM_PROMPT_TEMPLATE = """You are AIGHAR, the AI real estate assistant for RightGhar — India's comprehensive platform for new launch and under-construction properties.

CRITICAL RULES:
1. Answer questions STRICTLY based on the project listings provided below.
2. If information is not in the project data, respond: "Sorry, I don't have that information in our current listings."
3. Do not use external knowledge or make assumptions about projects not listed below.
4. Always reference specific projects when answering.
5. When recommending projects, return at most 5 relevant project slugs.

YOUR CAPABILITIES:
- Help buyers find projects matching their budget, location, BHK, and possession preferences
- Compare projects on price, area, amenities, and features
- Provide details about specific projects (amenities, pricing, configuration, etc.)
- Suggest projects based on user requirements
- Answer questions about builders, localities, and project specifications

RESPONSE STYLE:
- Be CONCISE, friendly, and conversational
- Use ₹ symbol for prices (e.g., ₹1.5 Cr)
- When listing projects, provide a brief summary including price range, location, BHK options, and possession timeline
- The user will see interactive project cards below your message, so keep summaries brief but informative
- If the user's request is vague, ask clarifying questions about budget, preferred location, BHK requirement, or possession timeline

IMPORTANT: You must respond in this EXACT JSON format:
{{
  "answer": "your concise, conversational response here",
  "project_slugs": ["slug1", "slug2"]
}}

If you didn't reference any specific projects, use an empty array: "project_slugs": []

AVAILABLE PROJECT LISTINGS:
{projects_content}

Now answer the user's question based only on the above project information, in the JSON format specified.
"""

    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        )

        self.data_loader = DataLoader()
        self._system_prompt: str | None = None

        # In-memory session storage with 30 minute TTL
        self.sessions: TTLCache = TTLCache(maxsize=1000, ttl=1800)

        logger.info("OpenAI service initialized")

    async def _ensure_system_prompt(self):
        """Build system prompt lazily after data is loaded."""
        if self._system_prompt is None:
            await self.data_loader.ensure_loaded()
            projects_content = self.data_loader.format_for_prompt()
            self._system_prompt = self.SYSTEM_PROMPT_TEMPLATE.format(
                projects_content=projects_content
            )
            logger.info(
                f"System prompt built with {len(self.data_loader.projects)} projects"
            )

    def _get_conversation_history(self, session_id: str) -> List[Dict[str, str]]:
        """Get or create conversation history for a session."""
        if session_id not in self.sessions:
            self.sessions[session_id] = [
                {"role": "system", "content": self._system_prompt}
            ]
            logger.info(f"Created new session: {session_id}")
        return self.sessions[session_id]

    async def chat_completion(
        self, session_id: str, message: str
    ) -> Tuple[str, List[str]]:
        """
        Process a chat message and return the assistant's response with project references.

        Returns:
            Tuple of (answer text, list of referenced project slugs)
        """
        try:
            await self._ensure_system_prompt()

            history = self._get_conversation_history(session_id)
            history.append({"role": "user", "content": message})

            logger.info(
                f"Processing chat for session {session_id}, message length: {len(message)}"
            )

            response = self.client.chat.completions.create(
                model=settings.AZURE_OPENAI_DEPLOYMENT,
                messages=history,
                temperature=0.7,
                max_tokens=1500,
                top_p=0.95,
                response_format={"type": "json_object"},
            )

            assistant_message = response.choices[0].message.content

            # Parse JSON response
            try:
                parsed_response = json.loads(assistant_message)
                answer = parsed_response.get("answer", assistant_message)
                project_slugs = parsed_response.get("project_slugs", [])

                if not isinstance(project_slugs, list):
                    project_slugs = []

                logger.info(
                    f"Chat completion successful for session {session_id}, "
                    f"referenced {len(project_slugs)} projects"
                )

            except json.JSONDecodeError:
                logger.warning("Failed to parse JSON response, using raw text")
                answer = assistant_message
                project_slugs = []

            # Store the answer in history
            history.append({"role": "assistant", "content": answer})

            return answer, project_slugs

        except Exception as e:
            logger.error(
                f"Error in chat completion for session {session_id}: {str(e)}"
            )
            raise
