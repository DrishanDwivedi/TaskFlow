resource "aws_key_pair" "my_key" {
  key_name   = "ec2-key"
  public_key = file("ec2-key.pub")
}

resource "aws_default_vpc" "default" {

}

resource "aws_security_group" "my_sg" {
    name = "TaskFlow-SG"
    description = "Security group for TaskFlow"
    vpc_id = aws_default_vpc.default.id

    ingress{
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress{
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress{
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress{
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        description = "Allow all outbound traffic"
    }
}

resource "aws_instance" "my_instance" {
    depends_on = [aws_security_group.my_sg, aws_key_pair.my_key]
    key_name = aws_key_pair.my_key.key_name
    security_groups = [aws_security_group.my_sg.name]
    instance_type = var.instance_type
    ami = var.ec2_ami_id
    root_block_device {
        volume_size = 8
        volume_type = "gp3"
    }
}