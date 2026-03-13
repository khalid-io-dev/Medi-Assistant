# Terraform Outputs

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.rg.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.rg.location
}

output "container_registry_login_server" {
  description = "Login server for the container registry"
  value       = azurerm_container_registry.acr.login_server
}

output "container_registry_admin_username" {
  description = "Admin username for the container registry"
  value       = azurerm_container_registry.acr.admin_username
}

output "container_registry_admin_password" {
  description = "Admin password for the container registry"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.storage.name
}

output "storage_account_connection_string" {
  description = "Connection string for the storage account"
  value       = azurerm_storage_account.storage.connection_string
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.logs.id
}

output "container_app_environment_id" {
  description = "ID of the Container Apps environment"
  value       = azurerm_container_app_environment.env.id
}
