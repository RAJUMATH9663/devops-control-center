terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source      = "./modules/vpc"
  vpc_cidr    = var.vpc_cidr
  environment = var.environment
}

module "eks" {
  source       = "./modules/eks"
  cluster_name = "${var.project_name}-${var.environment}-cluster"
  environment  = var.environment
  subnet_ids   = module.vpc.private_subnet_ids
}
