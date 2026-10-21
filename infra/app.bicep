param location string
param githubRepository string
param deployerRoleId string

resource site 'Microsoft.Web/staticSites@2024-04-01' = {
  name: 'swa-retirator'
  location: location
  tags: { app: 'retirator' }
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Disabled'
    allowConfigFileUpdates: true
  }
}

resource deployer 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-retirator-github'
  location: location
  tags: { app: 'retirator' }
}

// GitHub OIDC trust, limited to the `production` environment, which accepts only the main branch.
// There is deliberately no preview credential: the SWA deployment token can also deploy to production.
resource productionCredential 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: deployer
  name: 'github-production'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubRepository}:environment:production'
    audiences: ['api://AzureADTokenExchange']
  }
}

resource deployerAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(site.id, deployer.id, deployerRoleId)
  scope: site
  properties: {
    roleDefinitionId: deployerRoleId
    principalId: deployer.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output staticWebAppName string = site.name
output defaultHostname string = site.properties.defaultHostname
output deployerClientId string = deployer.properties.clientId
