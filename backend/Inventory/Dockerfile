FROM python:3.10.8-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev

COPY . /app

RUN pip install --no-cache-dir -r Inventory/requirements.txt

EXPOSE 8002

CMD ["uvicorn", "Inventory.main:app", "--host", "0.0.0.0", "--port", "8002"]