from sentence_transformers.util import dot_score
from pathlib import Path

_DATA = _load_data(Path(__file__).parent.resolve() / "auto_reply.txt")
del _load_data
