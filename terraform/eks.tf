module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "shortlink-cluster"
  cluster_version = "1.32" 


  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  
  cluster_endpoint_public_access = true

  
  enable_cluster_creator_admin_permissions = true


  eks_managed_node_groups = {
    initial = {
      instance_types = ["t3.medium"]

      min_size     = 1
      max_size     = 3
      desired_size = 2 
    }
  }

  tags = {
    Environment = "Production"
    Terraform   = "true"
  }
}