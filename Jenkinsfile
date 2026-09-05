pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Validate HTML') {
            steps {
                bat 'npm install html-validate'
                bat 'npx html-validate "**/*.html"'
            }
        }
        stage('Build') {
            steps {
                echo 'Static site — no build step required'
            }
        }
    }
}
