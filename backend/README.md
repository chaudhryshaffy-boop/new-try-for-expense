# Backend (FastAPI)

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env as needed
uvicorn app.main:app --reload
```

## Docker (with Postgres)

```bash
cp .env.example .env
cd ..
docker compose up -d --build
```

## Testing

```bash
cd backend
pytest -q
```