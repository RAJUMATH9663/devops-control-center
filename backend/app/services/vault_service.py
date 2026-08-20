import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class VaultSecretService:
    """
    HashiCorp Vault client with dynamic secret storage and automated regex-based secret masking.
    """

    # Common secret patterns for automatic log sanitization
    SECRET_PATTERNS = [
        # AWS Access Key & Secret Key
        (r"(?i)(?:aws_secret_access_key|aws_access_key_id|access_key|secret_key)\s*[:=]\s*['\"]?([A-Za-z0-9/+=]{16,40})['\"]?", "AWS_KEY"),
        # GitHub Personal Access Token
        (r"(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})", "GITHUB_PAT"),
        # Slack Webhook / Token
        (r"(https://hooks\.slack\.com/services/T[A-Za-z0-9_]+/B[A-Za-z0-9_]+/[A-Za-z0-9_]+)", "SLACK_WEBHOOK"),
        # Generic Bearer / JWT token
        (r"(?i)bearer\s+([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)", "JWT_TOKEN"),
        # Generic Password in connection strings
        (r"(?i)(?:password|passwd|pwd)\s*[:=]\s*['\"]?([^'\"\s\n]{6,})['\"]?", "PASSWORD"),
        # Postgres connection string password
        (r"postgresql://[^:]+:([^@]+)@", "DB_PASSWORD"),
    ]

    def __init__(self):
        # In-memory secret store simulating HashiCorp Vault KV v2 engine
        self._vault_store: Dict[str, Dict[str, Any]] = {
            "secret/data/production/database": {
                "username": "postgres_admin",
                "password": "supersecretpgpassword123",
                "host": "prod-db-1.internal",
                "port": 5432
            },
            "secret/data/ci/github": {
                "token": "ghp_mockPersonalAccessTokenForDevOps123456",
                "org": "acme-corp"
            },
            "secret/data/ci/jenkins": {
                "api_user": "admin",
                "api_token": "11a0987654321fedcba0987654321"
            },
            "secret/data/cloud/aws": {
                "aws_access_key_id": "AKIAIOSFODNN7EXAMPLE",
                "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
            }
        }

    def get_secret(self, path: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves secret payload from Vault path.
        """
        return self._vault_store.get(path)

    def set_secret(self, path: str, secret_data: Dict[str, Any]) -> bool:
        """
        Writes secret payload to Vault path.
        """
        self._vault_store[path] = secret_data
        logger.info(f"Secret updated at Vault path: {path}")
        return True

    def list_secret_paths(self) -> List[str]:
        """
        Lists all available secret paths.
        """
        return list(self._vault_store.keys())

    def mask_secrets(self, text: str) -> str:
        """
        Scans text and replaces any detected sensitive tokens/credentials with [MASKED_SECRET].
        """
        if not text:
            return text

        masked_text = text
        for pattern, label in self.SECRET_PATTERNS:
            masked_text = re.sub(
                pattern,
                lambda m: m.group(0).replace(m.group(1), f"[MASKED_{label}]") if len(m.groups()) >= 1 and m.group(1) else f"[MASKED_{label}]",
                masked_text
            )

        # Also mask known secrets stored in Vault
        for secret_dict in self._vault_store.values():
            for key, val in secret_dict.items():
                if isinstance(val, str) and len(val) > 5:
                    masked_text = masked_text.replace(val, f"[MASKED_VAULT_{key.upper()}]")

        return masked_text

vault_service = VaultSecretService()
