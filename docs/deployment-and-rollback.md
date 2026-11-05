# Deployment, Image Cleanup and Rollback Strategy

## 1. Deployment

The application is deployed using Docker Compose.

Command:
```powershell
docker-compose up -d
```

This starts the API Gateway, three microservices and their MySQL databases.

## 2. Docker Image Cleanup

After successful deployments, unused dangling Docker images can be identified using:

```powershell
docker image ls --filter "dangling=true"
```

To remove dangling images:

```powershell
docker image prune
```

Cleanup should be performed carefully to avoid affecting images used by running containers or other projects.

## 3. Persistent Storage

MySQL databases use Docker named volumes:

- user-db-data
- product-db-data
- order-db-data

These volumes preserve database data when containers are recreated.

## 4. Rollback Strategy

If a new application deployment fails:

1. Identify the previous stable application image versions.
2. Update the Docker Compose configuration to use those previous image versions.
3. Deploy the previous version using Docker Compose.
4. Verify application health using the API Gateway health endpoint.

Health check:
```powershell
curl.exe http://127.0.0.1:8082/health
```

## 5. Conclusion

Docker image cleanup helps manage disk usage. Versioned images and Docker Compose provide a way to restore a previously working application deployment.
## 6. Verified Jenkins Deployment Evidence

Jenkins build #20 completed successfully with the result `SUCCESS`.

The pipeline performed the following operations:

- Deployed user-service, product-service and order-service using Docker Compose.
- Verified the API Gateway health endpoint.
- Tested the Users, Products and Orders API endpoints.
- Confirmed that all application health checks passed.
- Archived nine Trivy JSON vulnerability scan reports.

Jenkins build #20:
http://127.0.0.1:8080/job/three-microservices-cicd/20/

### Rollback Verification Status

The current application images are tagged `latest`. Separate versioned previous images have not yet been verified.

Therefore, the rollback procedure is documented but has not yet been executed or tested.

For reliable rollback, future deployments should use versioned image tags rather than relying exclusively on `latest`. A previous known-good image version should be retained until the new deployment has passed its health checks.

Database volumes must be preserved during application rollback to avoid data loss.
