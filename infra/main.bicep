targetScope = 'subscription'

@description('Azure region for the resource group and the Static Web App metadata. Content is served globally.')
param location string = 'westeurope'

param resourceGroupName string = 'rg-retirator'

@description('GitHub repository allowed to deploy, as owner/name.')
param githubRepository string = 'pretyk/retirator'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: { app: 'retirator' }
}

// Least privilege: the GitHub identity can only read the site and its deployment token.
resource deployerRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(subscription().id, resourceGroupName, 'retirator-swa-deployer')
  properties: {
    roleName: 'Retirator Static Web App deployer (${resourceGroupName})'
    description: 'Reads the Retirator Static Web App and its deployment token for GitHub Actions.'
    type: 'CustomRole'
    permissions: [
      {
        actions: [
          'Microsoft.Web/staticSites/read'
          'Microsoft.Web/staticSites/listSecrets/action'
        ]
        notActions: []
      }
    ]
    assignableScopes: [rg.id]
  }
}

module app 'app.bicep' = {
  scope: rg
  name: 'retirator-app'
  params: {
    location: location
    githubRepository: githubRepository
    deployerRoleId: deployerRole.id
  }
}

output resourceGroupName string = rg.name
output staticWebAppName string = app.outputs.staticWebAppName
output defaultHostname string = app.outputs.defaultHostname
output deployerClientId string = app.outputs.deployerClientId
output tenantId string = tenant().tenantId
output subscriptionId string = subscription().subscriptionId
