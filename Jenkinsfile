#!groovy

import groovy.json.JsonOutput

// Uncomment the stage for the environment (DC/OS or UCP) to which you are deploying
// Remove the stage for the other environment and variables specific for that environment

/* Application-specific values. Update based on your application.
 - Environments (DC/OS, UCP, Docker Registry) all have naming restrictions on paths.
 - In general, use only digits (0-9), dashes (-), dots (.), and lowercase letters (a-z)
 - Prefer names with a letter at the beginning and end or you might have problems
 - "applicationPortInContainer" should match what's exposed in your Dockerfile
 - "vaultPath" will be set as an environment variable for your application with "/${getDeploymentEnvironment()}" as a suffix
*/
// Application-specific values
def orgName = 'your-github-organization'
def applicationName = 'graphql'
def applicationPortInContainer = 8443
def dcosApplicationServicePath = 'your-github-organization/graphql'
def dockerImageRepo = 'your-github-organization/graphql'
def ucpGroupLabel = 'your-github-organization'
def vaultPath = 'secret/your-github-organization/graphql'

// DC/OS environment
def dcosLoadBalancer = 'apps.dcos.hpecorp.net'
def dcosMaster = 'dashboard.dcos.hpecorp.net'

// UCP environment
def ucpBundleEnvironment = 'https://dashboard.docker.hpecorp.net'
def ucpLoadBalancer = 'dindc.g4ihos.itcs.hpecorp.net'

// General values
def buildImage = 'hub.docker.hpecorp.net/global-it-addison/addison-build-test:3.0.0'
def dcosCliImage = 'hub.docker.hpecorp.net/global-it/dcos-cli:latest'
def dockerRegistry = 'hub.docker.hpecorp.net'
def npmRegistry = 'https://registry.npmjs.itcs.hpecorp.net/'
def vaultUrl = 'https://dashboard.docker.hpecorp.net:8200'

// values assisting in creation of docker repository
def createRepoApi = 'https://hub.docker.hpecorp.net/api/v0/repositories/your-github-organization'
def createRepoRequest = [
    name            : 'graphql',
    shortDescription: 'Graphql',
    longDescription : 'Graphql',
    visibility      : 'public',
    scanOnPush      : true
]

// variables for jmeter based performance test
def appHostname
def jmeterDockerImage = 'hub.docker.hpecorp.net/global-it/jmeter:1.0.0'

// Variables used during run
def dockerImage
def dockerImageTag
def gitInfo
def secrets

def getContainerCount() {
    // Define the number of containers you want in various environments based on GitHub branch
    if (env.BRANCH_NAME.startsWith('PR-')) {
        return 1
    } else if (env.BRANCH_NAME == 'master') {
        return 4
    }

    return 2
}

def getDeploymentEnvironment() {
    if (env.BRANCH_NAME.startsWith('PR-')) {
        return 'development'
    } else if (env.BRANCH_NAME == 'master') {
        return 'production'
    }

    return env.BRANCH_NAME
}

def shouldRunPerformanceTest() {
    // conducts performance testing if flag is set to true
    def performanceTest = true;

    if (getDeploymentEnvironment() != 'production' && performanceTest) {
        return true;
    }
    return false;
}

pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr:'10'))
        timestamps()
        ansiColor('xterm')
    }
    agent {
        label 'docker-in-docker'
    }
    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }
        stage('Init') {
            steps {
                checkout scm
                script {
                    gitInfo = getGitInfo()
                    dockerImageTag = "${env.BRANCH_NAME}-${gitInfo.git_commit}"
                    echo "the change owner ${gitInfo.git_author} (${gitInfo.git_email})"
                }
            }
        }
        stage('Vault') {
            steps {
                script {
                    secrets = vaultGetSecrets()
                }
            }
        }
        stage('Build') {
            steps {
                echo "Building ${dockerImageTag}"
                script {
                    docker.image(buildImage).inside {
                        sh "npm config set registry ${npmRegistry}"
                        sh 'npm install --only-production'
                    }

                    dockerImage = docker.build "${dockerRegistry}/${dockerImageRepo}:${dockerImageTag}"
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    docker.image(buildImage).inside {
                        sh "npm config set registry ${npmRegistry}"
                        sh 'npm install'
                        sh 'npm test'
                        sh 'npm run lint'
                    }
                }
            }
        }
        stage('Docker Publish to Registry') {
            steps {
                echo "Publishing to Docker: ${dockerRegistry}/${dockerImageRepo}:${dockerImageTag}"
                script {
                    def passwordMask = [
                        $class: 'MaskPasswordsBuildWrapper',
                        varPasswordPairs: [[
                            password: secrets.password
                        ]]
                    ]

                    wrap(passwordMask) {
                        sh """
                            docker login --username ${secrets.username} --password \"${secrets.password}\" ${dockerRegistry}

                            statusCode=\$(curl -X POST -u ${secrets.username}:${secrets.password} -H "Content-Type: application/json" -d '${JsonOutput.toJson(createRepoRequest)}' -o -I -L -s -w "%{http_code}" ${createRepoApi})
                            if [ "\$statusCode" = '201' ]
                            then
                                echo 'Created docker repository with appropriate permissions.'
                            else
                                echo 'Create docker repository manually since auto create was not successful.'
                            fi
                        """
                        dockerImage.push();
                    }
                }
            }
        }
        /*
        stage('Deploy to UCP') {
            steps {
                script {
                    def ucpHostname
                    def serviceName
                    if (env.BRANCH_NAME == 'master') {
                        ucpHostname = "${applicationName}.${ucpLoadBalancer}"
                        serviceName = "${applicationName}"
                    } else {
                        def branchName = env.BRANCH_NAME.replace("_", "-").toLowerCase()
                        ucpHostname = "${applicationName}-${branchName}.${ucpLoadBalancer}"
                        serviceName = "${applicationName}-${branchName}"
                    }
                    appHostname = ucpHostname

                    // Open connection with UCP
                    ucpGetBundlePlane(secrets.username, secrets.password, "${ucpBundleEnvironment}")

                    def passwordMask = [
                        $class: 'MaskPasswordsBuildWrapper',
                        varPasswordPairs: [[
                            password: secrets.token
                        ]]
                    ]

                    wrap(passwordMask) {
                        sh """
                            export APP_ENV=${getDeploymentEnvironment()};
                            export APP_HOSTNAME=${ucpHostname};
                            export APP_NAME=${applicationName};
                            export APP_PORT=${applicationPortInContainer};
                            export APP_REPLICAS=${getContainerCount()};
                            export DOCKER_IMAGE_REPO=${dockerImageRepo};
                            export DOCKER_IMAGE_TAG=${dockerImageTag};
                            export DOCKER_REGISTRY=${dockerRegistry};
                            export UCP_GROUP_LABEL=${ucpGroupLabel};
                            export VAULT_ADDR=${vaultUrl};
                            export VAULT_APPLICATION_PATH=${vaultPath}/${getDeploymentEnvironment()};
                            export VAULT_GITHUB_TOKEN=${secrets.token};
                            export VAULT_SKIP_VERIFY=1;
                            sed -i \"s/APP_REPLICAS/\$APP_REPLICAS/\" ./compose.yaml;
                            cd ./bundle && source ./env.sh && cd ..;
                            docker info;
                            docker stack down ${serviceName} || true;
                            echo 'Waiting for service to fully stop'
                            sleep 10s
                            docker stack up -c ./compose.yaml ${serviceName};
                        """
                    }

                    echo '------------------------------------------------------------------------'
                    echo '-------  SUCCESS -------------------------------------------------------'
                    echo '------------------------------------------------------------------------'
                    echo "-------  URL: https://${ucpHostname}/apidocumentation ------------------"
                    echo '------------------------------------------------------------------------'
                }
            }
        }
        */
        /*
        stage('Deploy to DC/OS') {
            steps {
                script {
                    def dcosHostname
                    if (env.BRANCH_NAME == 'master') {
                        dcosHostname = "${applicationName}.${dcosLoadBalancer}"
                    }
                    else {
                        def branchName = env.BRANCH_NAME.replace('_', '-').toLowerCase()
                        dcosHostname = "${applicationName}-${branchName}.${dcosLoadBalancer}"
                        dcosApplicationServicePath = "${dcosApplicationServicePath}-${branchName}"
                    }
                    appHostname = dcosHostname

                    def passwordMask = [
                        $class: 'MaskPasswordsBuildWrapper',
                        varPasswordPairs: [[
                            password: secrets.password
                        ],[
                            password: secrets.token
                        ]]
                    ]

                    wrap(passwordMask) {
                        // Update placeholders in marathon.json
                        // Some commands use a hash separator because the replacement value contains a slash
                        sh """
                            sed -i 's/\"instances\":\\s*[0-9]\\+/\"instances\": ${getContainerCount()}/' marathon.json
                            sed -i 's/\"containerPort\":\\s*[0-9]\\+/\"containerPort\": ${applicationPortInContainer}/' marathon.json
                            sed -i 's/\"your-github-token\"/\"${secrets.token}\"/' marathon.json
                            sed -i 's/\"your-application-url.apps.dcos.hpecorp.net\"/\"${dcosHostname}\"/' marathon.json
                            sed -i 's/\"your-application-environment\"/\"${getDeploymentEnvironment()}\"/' marathon.json
                            sed -i 's/\"last-changed-by-user\"/\"${gitInfo.git_email}\"/' marathon.json
                            sed -i 's#\"vault-address\"#\"${vaultUrl}\"#' marathon.json
                            sed -i 's#\"your-vault-secret-path\"#\"${vaultPath}/${getDeploymentEnvironment()}\"#' marathon.json
                            sed -i 's#\"your-service-path\"#\"${dcosApplicationServicePath}\"#' marathon.json
                            sed -i 's#\"your-docker-image-location\"#\"${dockerRegistry}/${dockerImageRepo}:${dockerImageTag}\"#' marathon.json
                        """

                        // Authenticate and deploy to DC/OS
                        docker.image(dcosCliImage).inside("-u root") {
                            sh """
                                /dcos/dcos config set core.dcos_url https://${dcosMaster}
                                /dcos/dcos config set core.ssl_verify false
                                /dcos/dcos auth login --username=${secrets.username} --password=${secrets.password}
                                /dcos/dcos marathon app remove ${dcosApplicationServicePath} || true
                                echo 'Waiting for service to fully stop'
                                sleep 10s
                                /dcos/dcos marathon app add marathon.json
                            """
                        }
                    }

                    echo '------------------------------------------------------------------------'
                    echo '-------  SUCCESS -------------------------------------------------------'
                    echo '------------------------------------------------------------------------'
                    echo "-------  URL: https://${dcosHostname}/apidocumentation -----------------"
                    echo '------------------------------------------------------------------------'
                }
            }
        }
        */
        /*
        stage('Performance Test') {
            steps {
                script {
                    if (shouldRunPerformanceTest()) {
                        docker.image(jmeterDockerImage).inside {
                            echo 'Starting performance testing of configured APIs'

                            def passwordMask = [
                                $class: 'MaskPasswordsBuildWrapper',
                                varPasswordPairs: [[
                                    password: secrets.token
                                ]]
                            ]

                            wrap(passwordMask) {
                                sh """
                                # waits until the application fully deploys
                                sleep 10s

                                # initializes test results markdown header
                                summary='|API path|Users|Iterations|Total requests|Requests per second|Average response time (ms)|Minimum response time (ms)|Maximum response time (ms)|Total errors|\\n|-|-|-|-|-|-|-|-|-|\\n'

                                # tests all configured APIs one by one for their performance
                                isErr=false
                                for configLine in \$(grep '.' ./test/performance/config.csv)
                                do
                                    apiPath=\$(echo \$configLine | cut -d',' -f1)
                                    method=\$(echo \$configLine | cut -d',' -f2)
                                    request=\$(echo \$configLine | cut -d',' -f3)
                                    users=\$(echo \$configLine | cut -d',' -f4)
                                    iterations=\$(echo \$configLine | cut -d',' -f5)

                                    # runs jmeter based test for the current API
                                    result=\$(jmeter -Jhost=${appHostname} -JapiPath=\$apiPath -Jmethod=\$method -Jusers=\$users -Jiterations=\$iterations -Jrequest=\$request -n -t ./test/performance/apiTest.jmx)

                                    # extracts the relevant test result data from the jmeter summary output report
                                    summaryLine=\$(echo "\$result" | grep -e 'summary =' | tail -1 | sed 's/ \\+/|/g')
                                    totReq=\$(echo \$summaryLine | cut -d'|' -f3)
                                    reqPerSec=\$(echo \$summaryLine | cut -d'|' -f7)
                                    average=\$(echo \$summaryLine | cut -d'|' -f9)
                                    min=\$(echo \$summaryLine | cut -d'|' -f11)
                                    max=\$(echo \$summaryLine | cut -d'|' -f13)
                                    err=\$(echo \$summaryLine | cut -d'|' -f15)

                                    # checks if there is atleast one request resulted in an error while performance testing current API
                                    if [ \$isErr != true -a \$err -gt 0 ]
                                    then
                                      isErr=true
                                    fi

                                    summary=\${summary}'|'\$apiPath'|'\$users'|'\$iterations'|'\$totReq'|'\$reqPerSec'|'\$average'|'\$min'|'\$max'|'\$err'|\\n'
                                done

                                # provides pointer to reader to enable easily understand test results
                                summary=\${summary}'\\nTo understand the above data, click [here](https://github.hpe.com/global-it-addison/documentation/blob/master/PerformanceTesting.MD#configure-performance-tests)\\n'

                                # posts performance test results to GitHub by invoking its 'Create Repo Issue' API if the branch is a non-PR branch, else 'Create PR Comment' API
                                title='JMeter conducted API performance test results'
                                if [ ${env.BRANCH_NAME.startsWith('PR-')} ]
                                then
                                    # posts test results to GitHub PR as a comment
                                    prNumber=\$(echo ${env.BRANCH_NAME} | cut -d'-' -f2)
                                    resultPostUrl='https://github.hpe.com/api/v3/repos/${orgName}/${applicationName}/issues/'\${prNumber}'/comments'
                                    resultWatchUrl='https://github.hpe.com/${orgName}/${applicationName}/pull/'\${prNumber}
                                else
                                    # posts test results to GitHub Repo as an issue
                                    resultPostUrl='https://github.hpe.com/api/v3/repos/${orgName}/${applicationName}/issues'
                                    resultWatchUrl='https://github.hpe.com/${orgName}/${applicationName}/issues'

                                    # adds branch name and commit ID to enable user correlate the results
                                    summary=\${summary}'\\nThis post is related to ${env.BRANCH_NAME}-${gitInfo.git_commit}\\n'
                                fi

                                # posts performance test results to GitHub and enables users quickly navigate to results view page
                                curl -H "Authorization: token ${secrets.token}" -X POST --data-binary '{"title": "JMeter conducted API performance test results", "body": "'"\$summary"'"}' \$resultPostUrl
                                echo "Check performance test results at \$resultWatchUrl"

                                # explicitly fails build if one or more requests resulted in error occurred during performance testing
                                if [ \$isErr = true ]
                                then
                                    echo "Build failed as one or more requests resulted in error while performance testing configured APIs"
                                    exit 1
                                fi
                            """
                            }
                        }
                    } else {
                        echo 'Skipping performance testing, because either git branch is not development or performanceTest flag is not set to true'
                    }
                }
            }
        }
        */
    }
    post {
        success {
            logstashPush('SUCCESS')
        }
        failure {
            logstashPush('FAILURE')
        }
        unstable {
            logstashPush('UNSTABLE')
        }
        always {
            sh 'docker logout hub.docker.hpecorp.net'
            deleteDir()
        }
    }
}
