from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    kubeconfig_ref = Column(String, nullable=True) # Reference to vault or settings
    provider = Column(String) # AWS, GCP, Minikube
    
    namespaces = relationship("Namespace", back_populates="cluster", cascade="all, delete-orphan")

class Namespace(Base):
    __tablename__ = "namespaces"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    
    cluster = relationship("Cluster", back_populates="namespaces")

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    ansible_group = Column(String, nullable=True)
