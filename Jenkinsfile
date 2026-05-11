pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USER = 'royabhishek2645'
        BACKEND_IMAGE = "${DOCKERHUB_USER}/coursehub-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/coursehub-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:latest ./Server"
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                    docker build \
                        --build-arg VITE_BASE_URL=http://13.201.66.83:4000/api/v1 \
                        --build-arg VITE_RAZORPAY_KEY=rzp_test_S8bsxIXi8nAl6w \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:latest"
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    docker compose -f docker-compose.prod.yml pull
                    docker compose -f docker-compose.prod.yml up -d --force-recreate
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout'
            // Clean up dangling images to save disk space
            sh 'docker image prune -f || true'
        }
        success {
            echo 'Pipeline completed successfully! App is live at http://13.201.66.83'
        }
        failure {
            echo 'Pipeline failed! Check the logs above.'
        }
    }
}
