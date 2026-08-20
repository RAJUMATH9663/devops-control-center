from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.deployment import Deployment, Pipeline
from app.models.user import User
from app.schemas.deployment import DeploymentCreate, DeploymentResponse, PipelineCreate, PipelineResponse

router = APIRouter()

@router.get("/pipelines", response_model=List[PipelineResponse])
def read_pipelines(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve pipelines.
    """
    pipelines = db.query(Pipeline).offset(skip).limit(limit).all()
    return pipelines

@router.post("/pipelines", response_model=PipelineResponse)
def create_pipeline(
    *,
    db: Session = Depends(deps.get_db),
    pipeline_in: PipelineCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new pipeline.
    """
    pipeline = Pipeline(
        project_id=pipeline_in.project_id,
        jenkins_job_name=pipeline_in.jenkins_job_name,
        status=pipeline_in.status
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    return pipeline

@router.get("/", response_model=List[DeploymentResponse])
def read_deployments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve deployments.
    """
    deployments = db.query(Deployment).offset(skip).limit(limit).all()
    return deployments

@router.post("/", response_model=DeploymentResponse)
def create_deployment(
    *,
    db: Session = Depends(deps.get_db),
    deployment_in: DeploymentCreate,
    pipeline_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Trigger a new deployment.
    """
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
        
    deployment = Deployment(
        pipeline_id=pipeline_id,
        environment=deployment_in.environment,
        status="pending",
        triggered_by=current_user.id
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return deployment
