
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
                bat 'docker compose version'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                bat 'docker compose config -q'
            }
        }

        stage('Build Microservices') {
            steps {
                bat 'docker compose build'
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }
        failure {
            echo 'CI pipeline failed. Check the console output.'
        }
    }
}
