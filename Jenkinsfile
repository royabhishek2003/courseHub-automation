pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USER        = 'royabhishek2645'
        BACKEND_IMAGE         = "${DOCKERHUB_USER}/coursehub-backend"
        FRONTEND_IMAGE        = "${DOCKERHUB_USER}/coursehub-frontend"
        EC2_APP_HOST          = '13.206.150.216'
    }

    stages {

        // ─── Stage 1: Checkout ───────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out from ${env.GIT_BRANCH}"
            }
        }

        // ─── Stage 2: Commit Lint + ESLint ───────────────────────
        stage('Commit Lint + ESLint') {
            steps {
                echo '🔍 Running Commit Lint...'
                sh '''
                    npm install --save-dev @commitlint/cli @commitlint/config-conventional
                    COMMIT_MSG=$(git log -1 --pretty=%B)
                    echo "$COMMIT_MSG" | npx commitlint
                '''

                echo '🔍 Running ESLint on frontend...'
                dir('frontend') {
                    sh 'npm ci --legacy-peer-deps'
                    sh 'npm run lint'
                }
            }
        }

        // ─── Stage 3: Build Application ──────────────────────────
        stage('Build Application') {
            steps {
                echo '🏗️ Building frontend production bundle...'
                dir('frontend') {
                    sh 'VITE_BASE_URL=http://${EC2_APP_HOST}/api/v1 VITE_RAZORPAY_KEY=rzp_test npm run build'
                }
                echo '✅ Frontend build successful'
            }
        }

        // ─── Stage 4: Run Tests ──────────────────────────────────
        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                dir('Server') {
                    sh 'npm install'
                    // Add test command when tests are written
                    // sh 'npm test'
                    echo '⚠️ No backend tests configured yet — skipping'
                }
                dir('frontend') {
                    // Add test command when tests are written
                    // sh 'npm test'
                    echo '⚠️ No frontend tests configured yet — skipping'
                }
                echo '✅ Test stage complete'
            }
        }

        // ─── Stage 5: Docker Build ──────────────────────────────
        stage('Docker Build') {
            steps {
                echo '🐳 Building Docker images...'
                sh "docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ./Server"
                sh """
                    docker build \
                        --build-arg VITE_BASE_URL=http://${EC2_APP_HOST}/api/v1 \
                        --build-arg VITE_RAZORPAY_KEY=rzp_test_S8bsxIXi8nAl6w \
                        -t ${FRONTEND_IMAGE}:latest \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        ./frontend
                """
                echo "✅ Docker images built with tags: latest, ${BUILD_NUMBER}"
            }
        }

        // ─── Stage 6: Push to Docker Hub ─────────────────────────
        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                echo '✅ Images pushed to Docker Hub'
            }
        }

        // ─── Stage 7: Deploy to AWS ─────────────────────────────
        stage('Deploy to AWS') {
            steps {
                echo "🚀 Deploying to EC2 (${EC2_APP_HOST})..."
                sshagent(['ec2-ssh-key']) {
                    // Sync latest code (monitoring configs etc.) to App EC2
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_APP_HOST} '
                            cd ~/coursehub &&
                            git pull origin main &&
                            echo "✅ Code synced!"
                        '
                    """
                    // Deploy application
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_APP_HOST} '
                            cd ~/coursehub &&
                            docker compose -f docker-compose.prod.yml pull &&
                            docker compose -f docker-compose.prod.yml up -d --force-recreate &&
                            docker image prune -f &&
                            echo "✅ App deployment complete!"
                        '
                    """
                    // Deploy monitoring stack
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_APP_HOST} '
                            cd ~/coursehub &&
                            docker compose -f monitoring/docker-compose.monitoring.yml pull 2>/dev/null || true &&
                            docker compose -f monitoring/docker-compose.monitoring.yml up -d &&
                            echo "✅ Monitoring stack deployed!"
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            sh 'docker image prune -f || true'
        }
        success {
            echo """
            ════════════════════════════════════════════
            ✅ PIPELINE SUCCESSFUL — Build #${BUILD_NUMBER}
            ════════════════════════════════════════════
            🌐 App:        http://${EC2_APP_HOST}
            📊 Grafana:    http://${EC2_APP_HOST}:3000
            🔥 Prometheus: http://${EC2_APP_HOST}:9090
            ════════════════════════════════════════════
            """
        }
        failure {
            echo """
            ════════════════════════════════════════════
            ❌ PIPELINE FAILED — Build #${BUILD_NUMBER}
            ════════════════════════════════════════════
            Check the stage logs above for errors.
            """
        }
    }
}
