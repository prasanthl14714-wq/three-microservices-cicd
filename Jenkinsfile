
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Verify Tools') {
            steps {
                bat 'git --version'
                bat 'docker --version'
                bat 'docker-compose version'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                bat 'docker-compose config -q'
                echo 'Docker Compose configuration is valid.'
            }
        }

        stage('Build Microservices') {
            steps {
                bat 'docker-compose build user-service product-service order-service'
                echo 'All microservice images built successfully.'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                bat 'if not exist docs\\trivy-reports mkdir docs\\trivy-reports'

                bat '"C:\\Tools\\Trivy\\trivy.exe" image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 --format json --output docs\\trivy-reports\\user-service.json three-microservices-cicd-user-service:latest'

                bat '"C:\\Tools\\Trivy\\trivy.exe" image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 --format json --output docs\\trivy-reports\\product-service.json three-microservices-cicd-product-service:latest'

                bat '"C:\\Tools\\Trivy\\trivy.exe" image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 --format json --output docs\\trivy-reports\\order-service.json three-microservices-cicd-order-service:latest'

                echo 'No HIGH or CRITICAL vulnerabilities found.'
            }
        }

        stage('Deploy Application') {
            steps {
                bat 'docker-compose up -d --no-deps user-service product-service order-service'
                bat 'docker-compose restart nginx'
                bat 'timeout /t 5 /nobreak >nul'
                echo 'Application services deployed and API Gateway refreshed.'
            }
        }

        stage('Application Health Check') {
            steps {
                bat '''
                    curl.exe --fail --silent --show-error http://127.0.0.1:8082/health
                    curl.exe --fail --silent --show-error http://127.0.0.1:8082/api/users
                    curl.exe --fail --silent --show-error http://127.0.0.1:8082/api/products
                    curl.exe --fail --silent --show-error http://127.0.0.1:8082/api/orders
                '''
                echo 'All application health checks passed.'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'docs/trivy-reports/*.json',
                             fingerprint: true,
                             allowEmptyArchive: true
        }

        success {
            echo 'CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD pipeline failed. Check the console output.'
        }
    }
}
