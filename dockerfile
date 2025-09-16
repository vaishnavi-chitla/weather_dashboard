# Use a lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files (app + static)
COPY . .

# Expose port for Uvicorn
EXPOSE 8000

# Start FastAPI app
#CMD ["gunicorn","uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
