
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
                bat 'docker-compose build'
                echo 'All microservice images built successfully.'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                bat 'if not exist docs\\trivy-reports mkdir docs\\trivy-reports'

                bat '"C:\\Tools\\Trivy\\trivy.exe" image --format json --output docs\\trivy-reports\\user-service.json three-microservices-cicd-user-service:latest'

                bat '"C:\\Tools\\Trivy\\trivy.exe" image --format json --output docs\\trivy-reports\\product-service.json three-microservices-cicd-product-service:latest'

                bat '"C:\\Tools\\Trivy\\trivy.exe" image --format json --output docs\\trivy-reports\\order-service.json three-microservices-cicd-order-service:latest'

                echo 'Trivy security scans completed.'
            }
        }

        stage('Deploy Application') {
            steps {
                bat 'docker-compose up -d'
                echo 'Application deployed successfully.'
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'docs/trivy-reports/*.json',
                             fingerprint: true
            echo 'CI pipeline completed successfully!'
        }

        failure {
            echo 'CI pipeline failed. Check the console output.'
        }
    }
}

