from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class DeploymentBase(BaseModel):
    environment: str
    status: str = "pending"

class DeploymentCreate(DeploymentBase):
    pass

class DeploymentResponse(DeploymentBase):
    id: int
    pipeline_id: int
    triggered_by: int
    timestamp: datetime

    class Config:
        from_attributes = True

class PipelineBase(BaseModel):
    jenkins_job_name: str
    status: str = "idle"

class PipelineCreate(PipelineBase):
    project_id: int

class PipelineResponse(PipelineBase):
    id: int
    project_id: int
    deployments: List[DeploymentResponse] = []

    class Config:
        from_attributes = True
