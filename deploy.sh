#!/bin/bash

# Create secrets.env from environment variables (ensure these are set in your CI/CD)
echo "DB_PASSWORD=${DB_PASSWORD}" >> k8s/secrets.env
echo "DB_USER=${DB_USER}" >> k8s/secrets.env

# Create configs.env if you also manage it this way
echo "DB_HOST=${DB_HOST}" >> k8s/configs.env
echo "DB_NAME=${DB_NAME}" >> k8s/configs.env
echo "DB_PORT=${DB_PORT}" >> k8s/configs.env

ORIGINAL_IMAGE_NAME_IN_KUSTOMIZATION="your-dockerhub-username/todo-app"
echo "Updating image in kustomization.yaml to: ${IMAGE_NAME}:${IMAGE_TAG}"
cd k8s/
kustomize edit set image "${ORIGINAL_IMAGE_NAME_IN_KUSTOMIZATION}=${IMAGE_NAME}:${IMAGE_TAG}"
cd ..

echo "Applying Kustomize configurations..."
kubectl apply -k k8s/

# Optional: Clean up the generated .env files if they were temporary
rm k8s/secrets.env
rm k8s/configs.env

echo "Deployment complete."