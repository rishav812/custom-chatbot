from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, true
from app.database import Base

class TrainwellDocument(Base):
    __tablename__ = "trainwell_documents"
    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=True)
    url=Column(String,nullable=True)
    status=Column(String,nullable=True)
    created_ts=Column(DateTime, default=datetime.now)
    updated_ts=Column(DateTime,default=datetime.now, onupdate=datetime.now)

    def as_dict(self):
        return {
            column.name: getattr(self, column.name) for column in self.__table__.columns
        }
