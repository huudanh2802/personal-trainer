// Skeleton for Azure Container Apps + optional Azure Files volume for /data.
// Deploy with: az deployment group create -g <rg> -f infra/main.bicep -p mealApiKey=<secret>

@description('Azure region')
param location string = resourceGroup().location

@description('API key sent as x-api-key from the mobile app')
@secure()
param mealApiKey string

var appName = 'personal-trainer-meal-api'
var envName = '${appName}-env'

resource ce 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  properties: {}
}

resource ca 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: ce.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
      }
      secrets: [
        {
          name: 'meal-api-key'
          value: mealApiKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '<your-acr>.azurecr.io/personal-trainer-meal-api:latest'
          env: [
            {
              name: 'MEAL_API_KEY'
              secretRef: 'meal-api-key'
            }
            {
              name: 'PORT'
              value: '8080'
            }
            {
              name: 'DATA_DIR'
              value: '/data'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 2
      }
    }
  }
}

output fqdn string = ca.properties.configuration.ingress.fqdn
