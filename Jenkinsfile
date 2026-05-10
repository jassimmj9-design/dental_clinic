pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Install & Security') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Frontend: Install & Build') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run lint || true'
                    sh 'npm run build'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo 'Build terminé'
        }
        failure {
            echo 'Le pipeline a échoué'
        }
    }
}
