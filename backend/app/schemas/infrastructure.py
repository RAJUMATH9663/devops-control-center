from typing import Optional, List
from pydantic import BaseModel

class NamespaceBase(BaseModel):
    name: str

class NamespaceCreate(NamespaceBase):
    pass

class NamespaceResponse(NamespaceBase):
    id: int
    cluster_id: int

    class Config:
        from_attributes = True

class ClusterBase(BaseModel):
    name: str
    kubeconfig_ref: Optional[str] = None
    provider: Optional[str] = None

class ClusterCreate(ClusterBase):
    pass

class ClusterResponse(ClusterBase):
    id: int
    namespaces: List[NamespaceResponse] = []

    class Config:
        from_attributes = True

class ServerBase(BaseModel):
    hostname: str
    ip_address: str
    ansible_group: Optional[str] = None

class ServerCreate(ServerBase):
    pass

class ServerResponse(ServerBase):
    id: int

    class Config:
        from_attributes = True
