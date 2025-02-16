from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    # "postgresql://postgres:postgres123@localhost:5432/custom-chatbot",
    DATABASE_URL,
    pool_size=20,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        db.commit()
        yield db
    except:
        db.rollback()
        raise
    finally:
        db.close()