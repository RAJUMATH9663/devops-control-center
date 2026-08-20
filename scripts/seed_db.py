#!/usr/bin/env python3
"""
DevOps Control Center - Database Seed Script
Executes database table creation and populates initial roles, admin user, and settings.
"""
import sys
import os
import logging

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(os.path.dirname(current_dir), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting database initialization and seeding...")
    try:
        from app.core.init_db import init_db
        init_db()
        logger.info("=" * 60)
        logger.info("DATABASE SEED COMPLETED SUCCESSFULLY")
        logger.info("Default Admin User: admin@devops.io")
        logger.info("Default Password:   adminpassword123")
        logger.info("=" * 60)
    except Exception as e:
        logger.error(f"Database seeding failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
