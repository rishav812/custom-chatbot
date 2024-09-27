from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    Text,
)

from app.database import Base

class Keywords(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    chunk_id = Column(Text, nullable=True)
    created_ts = Column(DateTime, default=datetime.now)
    updated_ts = Column(DateTime, default=datetime.now, onupdate=datetime.now)