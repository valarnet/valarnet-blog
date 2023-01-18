---
title: "Part 6: Terraform - Enabling Collaboration"
date: "2022-06-10"
categories: 
  - "valarnet"
tags: 
  - "terraform"
---

This is the sixth in a series of posts about Terraform.

The previous parts are linked below

- [Part 1: Terraform – Getting Started](/posts/20220520-part-1-getting-started-with-terraform-background/)
- [Part 2: Terraform – Fundamentals](/posts/20220521-part-2-terraform-fundamental-concepts/)
- [Part 3: Terraform – Installation](/posts/20220521-part-3-terraform-installation/)
- [Part 4: Terraform – Configuration Files](/posts/20220525-part-4-terraform-configuration-basics/)
- [Part 5: Terraform – Code Structuring](/posts/20220602-part-5-terraform-code-structuring/)

In prior parts of this blog series, we noted terraform uses [backends](/posts/part-6-terraform-enabling-collaboration/) to store information about state of the infrastructure. We also stated the backend can be saved locally or remotely. The default backend behavior is to save in local. We can change this.

One of the major benefits we can get by changing the backend location is enabling collaboration among teams or team members.

Many teams and people are often involved in large and complex infrastructure projects. Each participant may have different expertise and roles to play. For instance, team members could be technically proficient in certain areas or others could be in overall change approval roles.

The code structuring practices we discussed in [a previous blog post](/posts/part-5-terraform-code-structuring/) also become useful constructs here. Structuring the code well allows for better permissions management and workflow definition. This is important regardless of what source code control system we are using or the repository the code is stored in.

Terraform helps enable collaboration among teams by allowing us to store the state data in a shared location. This is generally referred to as a remote backend.  It ensures there is a single source-of-truth about the state of the infrastructure for every member of  the project. Without a single source-of-truth tracking state of the infrastructure, subsequent deployments will pose significant risk to operations and infrastructure health.

Before applying any infrastructure changes, terraform reaches out to the remote backend and downloads the latest state data. It then makes the changes to the infrastructure based on plans against this up-to-date state data. Once it finishes the deployment process, terraform automatically uploads state data to the remote backend.

This is what the minimal configuration settings could look like if we were explicitly defining a local backend.
```hcl
terraform {
  backend "local" {
   path = "cd/Documents/terraform/terraform.tfstate" # Where are we storing the state data
 }
}
```
This code entry can be defined in the **main.tf** file or in its own **backend.tf** file or other depending on the code structure we have determined. The important bit to note is it is defined in the terraform block.

The "cd/Documents/terraform/…" path is wherever we have our working directory for the project.

From a configuration perspective, the way to change the backend to a remote location can be a simple modification of keyword from local to the type of backend we want to use. This will be accompanied by a definition of the attribute(s) each backend type expects.

There are built-in backends that can be used in terraform. These are here on the terraform [site](https://www.terraform.io/language/settings/backends) for viewing and are updated if new ones become available. They're listed on the left pane of the linked terraform page and cover a variety from **remote**, **azurerm**, **s3**, **Kubernetes**, etc.

One example of remote backend definition can be as below.
```hcl
terraform {
  backend "remote" {
    hostname = "this-is-the-hostname-of-remote-location"
    organization = "this-is-my-organization-name"
  }
}
```
For another example, let's say our choice is to have a backend in AWS S3 storage.
```hcl
terraform {
  backend "s3" {
    bucket = "this-is-my-backend-bucket-name"
    key    = "this-is-the-path-to-my-s3-key"
    region = "us-east-1"
  }
}
```
The workflow for enabling collaboration on a project needs to be carefully mapped out. As does the structure of the code. There also needs to be a clear definition of what code version control system we intend to use (GitHub, Git, Azure DevOps, etc.). All of which are beyond scope for us here but relevant to any collaborating team.

There are also many factors and challenges to consider in designing the terraform team collaboration workflow. Just a sample of which can be:

- What version of terraform are we using and if terraform is updated will it break compatibility with previous state file?
- Do members of the team have permission to access the state data if they are to be provisioning infrastructure?
- How is permission grant process managed?
- How does terraform manage simultaneous attempts to pull and update the state file by multiple team members?
- If the state needs to be locked for that window of time, how is it achieved and what are the implications? And so on.

We have only scratched the surface here.

There are technical as well as process requirements and considerations that demand multifaceted conversations involving various teams. This is critical if the goal is to come up with a stable workflow that can enable rather than stifle infrastructure provisioning efforts. The promises of adopting Infrastructure as Code can only be realized with good planning and use case definitions.

In the next post, we'll pick back up on the AWS topology from [the previous blog](/posts/part-5-terraform-code-structuring/) and wrap up its coding.
