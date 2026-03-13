# Configure Azure Provider
provider "azurerm" {
  features {}
}

# Create Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "cliniq-rg"
  location = "North Europe"
}

# Create Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "cliniqregistry"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  sku           = "Basic"
  admin_enabled = true
}

# Create Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "logs" {
  name                = "cliniq-logs"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  sku               = "PerGB2018"
  retention_in_days = 30
}

# Create Container Apps Environment
resource "azurerm_container_app_environment" "env" {
  name                       = "cliniq-env"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs.id
}

# Create Storage Account for ChromaDB
resource "azurerm_storage_account" "storage" {
  name                     = "cliniqstorage123"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location

  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Create File Share for ChromaDB
resource "azurerm_storage_share" "chroma" {
  name                 = "chromadb"
  storage_account_name = azurerm_storage_account.storage.name
  quota                = 5
}

# Create User Assigned Identity for Container App
resource "azurerm_user_assigned_identity" "container_app_identity" {
  name                = "cliniq-app-identity"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# Grant the identity access to the storage account
resource "azurerm_role_assignment" "storage_account_contributor" {
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_user_assigned_identity.container_app_identity.principal_id
}

# Create Container App
resource "azurerm_container_app" "cliniq" {
  name                         = "cliniq-api"
  resource_group_name          = azurerm_resource_group.rg.name
  location                    = azurerm_resource_group.rg.location
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"
  
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app_identity.id]
  }
  
  template {
    container {
      name   = "cliniq"
      image  = "cliniqregistry.azurecr.io/cliniq:latest"
      cpu    = 0.5
      memory = "1Gi"
    }
  }
  
  ingress {
    external_enabled = true
    target_port     = 8000
    
    traffic_weight {
      percentage = 100
    }
  }
}
