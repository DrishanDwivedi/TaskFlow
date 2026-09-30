variable "instance_type" {
  description = "The type of instance to use"
  type = string
  default = "t3.micro"
}

variable "ec2_ami_id"{
    description = "The AMI ID to use for the EC2 instance"
    type = string
    default = "ami-0b6d9d3d33ba97d99"
}