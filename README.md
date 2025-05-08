# Kubernetes Manifests for MongoDB and Calculator Microservice

## 1. MongoDB Deployment
- Deploys a single MongoDB pod.
- Uses secrets for `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`.
- Persists data using a `PersistentVolumeClaim` (PVC).

## 2. MongoDB Service
- Exposes MongoDB internally using a headless service.

## 3. MongoDB Secret
- Stores credentials securely using base64 encoding.

## 4. MongoDB PersistentVolumeClaim
- Allocates `5Gi` of storage for MongoDB data.

## 5. MongoDB Backup CronJob
- Runs every 6 hours using `mongodump`.
- Saves backups to a dedicated PVC.

## 6. Backup PVC
- Stores MongoDB backups.

## 7. MongoDB Exporter
- Deploys a Prometheus-compatible exporter for monitoring MongoDB metrics.
- Exposed via a separate service on port `9216`.

## 8. Calculator Microservice Deployment
- Node.js microservice for basic arithmetic operations.
- Connects to MongoDB using the environment variable `MONGO_URI`.
- Includes a liveness probe on the `/health` endpoint.

## 9. Calculator Service
- Exposes the calculator microservice on port `3000`.

---

## YAML Document Structure

All resources (Deployment, Service, PVC, Secrets, etc.) are defined in a single `deployment.yaml` file.  
Each resource block is separated using `---`, which is the YAML document separator.

---

## Working of the Service

### Step 1: Build Docker Image
```bash
docker build -t calculator-microservice:latest .
```
This will build teh latescalculator service image.


### Step 2: Apply Kubernetes Resources
```bash
kubectl apply -f deployment.yaml
```

This command deploys all the defined Kubernetes resources at once.
