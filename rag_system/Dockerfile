FROM python:3.11-slim

# Set up a non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY --chown=user . .

# Hugging Face Spaces expose port 7860
ENV PORT=7860

# Command to run the FastAPI server
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
