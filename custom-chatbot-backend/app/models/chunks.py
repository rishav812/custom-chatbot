from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True)
    keywords = Column(Text, nullable=False)
    chunk = Column(Text, nullable=False)
    training_document_id = Column(Integer, ForeignKey("trained_documents.id"))
    created_ts = Column(DateTime, default=datetime.now)
    updated_ts = Column(DateTime, default=datetime.now, onupdate=datetime.now)
