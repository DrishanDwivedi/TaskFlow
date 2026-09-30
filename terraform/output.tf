output "instance_publicip"{
    description = "The ip of instance"
    value = aws_instance.my_instance.public_ip
}