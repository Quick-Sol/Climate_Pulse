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
                bat 'npm install -g html-validate'
                bat 'html-validate "**/*.html"'
            }
        }
        stage('Build') {
            steps {
                echo 'Static site — no build step required'
            }
        }
    }
}
