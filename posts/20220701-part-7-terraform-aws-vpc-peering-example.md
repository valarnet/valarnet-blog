---
title: "Part 7: Terraform - AWS VPC Peering Example"
date: "2022-07-01"
categories: 
  - "valarnet"
tags: 
  - "aws"
  - "terraform"
---

This post will finish up building the AWS VPC peering topology example described in [part 5](/posts/part-5-terraform-code-structuring/) of this Terraform series. For context, it is recommended to check that out.

- [Part 1: Terraform – Getting Started](/posts/part-1-getting-started-with-terraform-background/)
- [Part 2: Terraform – Fundamentals](/posts/part-2-terraform-fundamental-concepts/)
- [Part 3: Terraform – Installation](/posts/part-3-terraform-installation/)
- [Part 4: Terraform – Configuration Files](/posts/part-4-terraform-configuration-basics/)
- [Part 5: Terraform – Code Structuring](/posts/part-5-terraform-code-structuring/)
- [Part 6: Terraform - Enabling Collaboration](/posts/part-6-terraform-enabling-collaboration/)

To make the description of the steps clearer and the code readable, I've structured the code as follows.

```
.
├── main.tf
├── vpc_subnets.tf
├── security_grps.tf
├── instances.tf
├── temp_remote_access.tf
├── routing.tf
├── peering.tf
├── changing.tfvars
├── variables.tf
```

The different VPC components are separated into their own files. You will see a vpc_subnets.tf, routing.tf, instances.tf etc. If you wanted to customize the infrastructure or add another VPC such as a "web" to play around with, this modularity makes it easy.

The code is uploaded over [here](https://github.com/valarnet/terraform-aws-vpc-peering-example) on GitHub. What each block of code does is commented on to make it easy to read and understand why it's there.

https://github.com/valarnet/terraform-aws-vpc-peering-example

The subnets in this example are private subnets. Therefore, to access the instances over SSH, I define elastic IPs and associate them to the network interfaces. There's a small cost associated with using elastic IPs but since this is a playground that is to be destroyed right after going through the exercise, that will be minimal.

The **temp_remote_access.tf** file defines the Internet gateway, AWS default route, and elastic IP resources needed to be able to reach EC2 instances.

There are only a few steps to run it. You can customize it before running it if you're comfortable.

1. Copy all the files into a single directory.
2. Change **your_public_ip** variable to match the public IP you will SSH from.
3. Change **app_vpc_owner_id** and **db_vpc_owner_id** variables in **changing.tfvars** to match the AWS account ID(s) you will be deploying in.
4. Open up a terminal window and cd to the directory.
```bash
cd Documents/terraform/vpc-peering-example
```
5. Define export variables for your credentials which terraform will use for authentication.
```bash
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_DEFAULT_REGION="aws_region"
```
6. Run **terraform init**. Terraform will initiate and download the provider plugin it needs.
```bash
terraform init
```
7. Run **terraform plan -var-file=changing.tfvars** and once done it should tell you 37 resources to add if starting from scratch.
```bash
terraform plan -var-file=changing.tfvars
```
8. Run **terraform apply -var-file=changing.tfvars** and confirm with a "yes" when requested.
```bash
terraform apply -var-file=changing.tfvars
```
9. Login to the AWS management console. Navigate to **VPC > Peering Connections**. There should be a new pending VPC peering connection. Select it and accept the VPC peering connection from the Actions drop down at the right top corner. The VPC will not become active and pass traffic until you do this.
10. SSH in to app-ec2-a instance using your key and run ping tests to verify. The self-ping to 172.23.0.4 should succeed. The ping to db-ec2-a instance 172.24.0.4 should also succeed. The ping to db-ec2-b 172.24.1.4 should fail because Apps in Subnet A aren't allowed to communicate with database instances in subnet B as was required.
```bash
ssh -i "my_ec2_key.cer" ec2-user@34.235.21.121

[ec2-user@ip-172-23-0-4 ~]$ ping 172.23.0.4
PING 172.23.0.4 (172.23.0.4) 56(84) bytes of data.
64 bytes from 172.23.0.4: icmp_seq=1 ttl=255 time=0.023 ms
64 bytes from 172.23.0.4: icmp_seq=2 ttl=255 time=0.036 ms
64 bytes from 172.23.0.4: icmp_seq=3 ttl=255 time=0.032 ms
64 bytes from 172.23.0.4: icmp_seq=4 ttl=255 time=0.030 ms
64 bytes from 172.23.0.4: icmp_seq=5 ttl=255 time=0.031 ms

[ec2-user@ip-172-23-0-4 ~]$ ping 172.24.0.4
PING 172.24.0.4 (172.24.0.4) 56(84) bytes of data.
64 bytes from 172.24.0.4: icmp_seq=1 ttl=255 time=1.48 ms
64 bytes from 172.24.0.4: icmp_seq=2 ttl=255 time=1.53 ms
64 bytes from 172.24.0.4: icmp_seq=3 ttl=255 time=1.48 ms
64 bytes from 172.24.0.4: icmp_seq=4 ttl=255 time=1.59 ms
64 bytes from 172.24.0.4: icmp_seq=5 ttl=255 time=1.48 ms

[ec2-user@ip-172-23-0-4 ~]$ ping 172.24.1.4
PING 172.24.1.4 (172.24.1.4) 56(84) bytes of data.
^C
--- 172.24.1.4 ping statistics ---
6 packets transmitted, 0 received, 100% packet loss, time 5112ms
```
11. Try out the other EC2 instances, look around in the AWS console to see what has been created, etc. Once done destroy the environment so it doesn't stay up and cost you.
12. Destroy the infrastructure using **terraform destroy -var-file=changing.tfvars**

This is the last post in the Terraform series. Obviously, we have only scratched at the surface of what Terraform can do and there are many concepts we haven't explored. But I hope this offered a starter for anyone looking into it.
