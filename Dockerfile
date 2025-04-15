
    FROM node:20 AS frontend-builder
    WORKDIR /app/frontend
    
    COPY frontend/.env.production .env.production
    COPY frontend/package.json frontend/package-lock.json ./
    RUN npm install
    COPY frontend/ ./
    RUN npm run build
    

    FROM python:3.11-slim AS backend
    

    RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

    RUN apt-get update && apt-get install -y curl build-essential && \
        curl -sSL https://install.python-poetry.org | python3 - && \
        ln -s /root/.local/bin/poetry /usr/local/bin/poetry
    

    WORKDIR /app
    

    COPY pyproject.toml poetry.lock ./
    RUN poetry config virtualenvs.create false && poetry install --no-root
    

    COPY src/ ./src/


    WORKDIR /app 
    COPY --from=frontend-builder /app/frontend/dist/ ./src/frontend/dist/

    

    COPY entrypoint.sh /entrypoint.sh
    RUN chmod +x /entrypoint.sh


    ENV FLASK_APP=src/run.py
    ENV FLASK_RUN_HOST=0.0.0.0
    ENV FLASK_RUN_PORT=8080


    EXPOSE 8080


    ENTRYPOINT ["/entrypoint.sh"]
