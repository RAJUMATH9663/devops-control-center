from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.infrastructure import Cluster, Server
from app.models.user import User
from app.schemas.infrastructure import ClusterCreate, ClusterResponse, ServerCreate, ServerResponse

router = APIRouter()

@router.get("/clusters", response_model=List[ClusterResponse])
def read_clusters(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve clusters.
    """
    clusters = db.query(Cluster).offset(skip).limit(limit).all()
    return clusters

@router.post("/clusters", response_model=ClusterResponse)
def create_cluster(
    *,
    db: Session = Depends(deps.get_db),
    cluster_in: ClusterCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new cluster.
    """
    cluster = Cluster(
        name=cluster_in.name,
        kubeconfig_ref=cluster_in.kubeconfig_ref,
        provider=cluster_in.provider
    )
    db.add(cluster)
    db.commit()
    db.refresh(cluster)
    return cluster

@router.get("/servers", response_model=List[ServerResponse])
def read_servers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve servers.
    """
    servers = db.query(Server).offset(skip).limit(limit).all()
    return servers

@router.post("/servers", response_model=ServerResponse)
def create_server(
    *,
    db: Session = Depends(deps.get_db),
    server_in: ServerCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new server.
    """
    server = Server(
        hostname=server_in.hostname,
        ip_address=server_in.ip_address,
        ansible_group=server_in.ansible_group
    )
    db.add(server)
    db.commit()
    db.refresh(server)
    return server
