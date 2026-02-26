#!/bin/sh
set -e

# mlflow db upgrade $MLFLOW_BACKEND_STORE_URI
# Start the MLflow server (it handles migrations automatically on startup)
echo "Starting MLflow server..."
exec "$@"
