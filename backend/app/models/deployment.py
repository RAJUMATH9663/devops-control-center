from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    jenkins_job_name = Column(String, nullable=False)
    status = Column(String, default="idle")
    
    project = relationship("Project", back_populates="pipelines")
    deployments = relationship("Deployment", back_populates="pipeline")

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id", ondelete="CASCADE"))
    environment = Column(String, nullable=False)  # e.g. dev, staging, prod
    status = Column(String, default="pending")
    triggered_by = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    pipeline = relationship("Pipeline", back_populates="deployments")
