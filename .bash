$ECR_URI = "347765733290.dkr.ecr.ap-southeast-1.amazonaws.com"

cd "c:\Users\Arisu\Downloads\html\Project_PC"

# --- NestJS microservices (dùng Dockerfile.service chung) ---
$services = @("auth-service","product-service","cart-service","order-service","payment-service","notification-service","saga-orchestration-service","chat-service","history-log","elasticsearch-service","api-gateway")

foreach ($svc in $services) {
    Write-Host "Building $svc..." -ForegroundColor Cyan
    docker build -t "projectpc/$svc" --build-arg SERVICE=$svc -f microservices/Dockerfile.service ./microservices
    docker tag "projectpc/$svc" "$ECR_URI/projectpc/${svc}:latest"
    docker push "$ECR_URI/projectpc/${svc}:latest"
}

# --- AI service (Dockerfile riêng) ---
docker build -t projectpc/ai-service -f microservices/apps/ai-service/Dockerfile ./microservices/apps/ai-service
docker tag projectpc/ai-service "$ECR_URI/projectpc/ai-service:latest"
docker push "$ECR_URI/projectpc/ai-service:latest"

# --- Client Next.js ---
docker build -t projectpc/client `
    --build-arg NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1 `
    --build-arg NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com `
    -f client/Dockerfile ./client
docker tag projectpc/client "$ECR_URI/projectpc/client:latest"
docker push "$ECR_URI/projectpc/client:latest"