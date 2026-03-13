# Terraform Variables

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "cliniq-rg"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "North Europe"
}

variable "container_registry_name" {
  description = "Name of the container registry"
  type        = string
  default     = "cliniqregistry"
}

variable "storage_account_name" {
  description = "Name of the storage account"
  type        = string
  default     = "cliniqstorage123"
}

variable "container_app_name" {
  description = "Name of the container app"
  type        = string
  default     = "cliniq-api"
}

variable "environment_name" {
  description = "Name of the container app environment"
  type        = string
  default     = "cliniq-env"
}
