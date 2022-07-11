---
title: "Part 1: Terraform - Getting Started"
date: "2022-05-20"
categories: 
  - "valarnet"
tags: 
  - "terraform"
---

Over the next few weeks, I will make a series of posts on Terraform. No, I am not referring to [Terraform Labs](https://www.investing.com/news/cryptocurrency-news/court-documents-reveal-do-kwon-dissolved-terraform-labs-korea-days-before-luna-crash-2828497) the crypto company that has been melting down in the past couple of weeks and wiping out the savings of retail crypto speculators.

We’ll be talking about [Terraform](https://www.terraform.io/) - the popular Infrastructure as Code (IaC) tool. I’ll begin by describing the fundamental concepts and build up to more complex uses of the tool to address real-world problems.

In this post:

- [Origin of the word Terraform](#Origin-of-Terraform)
- [Brief timeline of Terraform](#Terraform-Timeline)
- [What is Infrastructure as Code (IaC)?](#Infrastructure-as-Code)
- [Side-note: What is Infrastructure as Software (IaS)?](#Infrastrcture-as-Software)
- [What problem does Terraform exist to solve?](#What-Terraform-Solves)
- [What is Terraform?](#What-is-Terraform)
- [What are declarative versus imperative coding mindsets?](#Declarative-vs-Imperative)
- [Side-note: Intent-Based-Networking](#Intent-Based-Networking)
- [What are some alternatives to Terraform?](#Alternatives-to-Terraform)
- [Side-note: Vagrant](#Vagrant)
- [What is the Terraform lifecycle?](#Terraform-Lifecycle)

**Infrastructure as Code (IaC)** adoption has accelerated in recent times due to the advantages it offers over the traditional model of building, changing, and destroying Information Technology infrastructure. I'll describe what these benefits are as I evaluate them and list scenarios where it makes sense to adopt this model versus sticking to the old way.

###### **Origin of the word Terraform**

It may seem like a tangent but I find tracking the origin of interesting words enjoyable and value it as an insightful exercise. Precision in description is critical to understanding concepts and rewiring one's mental model about any subject under study.

Etymology of the word Terraform is stated at [wordsense.eu](https://www.wordsense.eu/terraform/)as a Latin and English combination of: _“**Terra** ("planet Earth") + **-form** ("having the form of"). Coined by American science fiction author Jack Williamson in his 1942 novella Collision Orbit."_ It points to a process of modifying an environment to have the characteristics of planet Earth: its atmosphere, topography, ecology, and the like.

The obvious logical next question is "wait, what does this have to do with IT infrastructure?" It is not a literal equivalent but close enough in essence with parallels to the process of infrastructure transformation. I remain curious to learn why and how Terraform’s creators landed on the choice of calling it by that name. If you have a link or info about that, make sure to share it in the comments.

###### **A Brief Timeline**

Terraform was created by the folks at HashiCorp. Co-founder of HashiCorp Mitchell Hashimoto has a very informative short [video](https://www.youtube.com/watch?v=RNHQ91afYkE) about how the idea for the project was conceived in 2011, wrote the first lines of code in 2014, and flew off to hit an inflection point in 2017. I highly recommend watching this video [here](https://www.youtube.com/watch?v=RNHQ91afYkE) for a concise background story.

###### **What is Infrastructure as Code (IaC)?**

The traditional model of IT infrastructure buildout evolved from its physical (mostly hardware-based) days to a virtualization-based model. This technological shift redefined and shortened the time-to-market periods it takes organizations to spin up and decommission business services and applications.

The speed with which infrastructure components can be created has been unleashed by virtualization technologies leading to the era of cloud computing we now take for granted. With increased speed, we need tools to improve accuracy in deployment and achieve environment standardization across the board.

IT infrastructure so deployed needs to be managed and operated continuously to ensure availability and security requirements are met consistently. The flexibility and efficiency tools bring to the process of building, changing, and destroying infrastructure components are what justify their adoption and value proposition.

**_The practice of managing infrastructure as one typically would a code versioning and release lifecycle grants it the nomination "Infrastructure as Code (IaC)."_** Thereby, classifying Terraform and tools like it as IaC tools. There are layers to argue this in some ways constitutes a misnomer but we’ll not pedantically dwell on it. Onwards with the talented marketing folks who continue to make their mark on the industry.

> **_Side-note:_** There is another way of looking at the world of infrastructure that is referred to as **Infrastructure as Software (IaS)**. In IaS, you retain the option of using your preferred coding language be it Python, Go, or another instead of being required to use the specific language & syntax structures IaC tools typically come tied to.

###### **What problem is Terraform created to address?**

**_The idea at the heart of it is you have a version of the infrastructure you currently run. It has a current state. Depending on the state of what you now have versus the state you want to transform it to, Terraform helps plan for infrastructure components to add, modify, or delete._** All this occurs under an automation and coding/development mindset. This is analogous to transforming a new planet to become Earth-like by changing its _current state_ to the _desired state_ of atmosphere, topography, and so on.

###### **What is Terraform?**

Terraform is one of many Infrastructure as Code tools available out there. It is an **_open-source declarative_** coding tool.

Declarative is just a way of saying you declare what you want to see happen as a desired state and let the computer "figure out" how to get from here to there. This is in contrast to _imperative or procedural_ coding tools where you specify to the computer the step-by-step and brick-by-brick process of what actions to take to reach an end goal. This procedural or imperative mindset is how C, C++, and other coding tools get the job done. Terraform does it declaratively and uses the HashiCorp Configuration Language (HCL).

> **_Side-note:_** If you’re familiar with recent developments in the field of networking, this should trigger in mind a linkage to intent-based networking. _**Intent-based networking (IBN)**_ is also based on a declarative model of network operations as opposed to the procedural way in which network engineers traditionally configure/operate multiple network devices.

Although an intriguing rabbit hole, an in-depth look or comparison between declarative versus imperative (procedural) mindsets is out of the scope of this series.

###### **Alternatives to Terraform**

Tools specific to vendor environments such as [AWS CloudFormation](https://aws.amazon.com/cloudformation/), [Azure Resource Manager (ARM) Templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/), and [Google Deployment Manager](https://cloud.google.com/deployment-manager/docs/) exist on one side to automate the creation, modification, and deletion of infrastructure resources in their respective cloud environments.

Whereas, on the other spectrum, vendor-agnostic tools such as [Ansible](https://www.ansible.com/overview/how-ansible-works), [Chef](https://www.tutorialspoint.com/chef/chef_architecture.htm), [Vagrant](https://www.vagrantup.com/), and myriad others are available. Terraform is among the vendor-agnostic ones. These tools differ in the depth of their capabilities and when it may be optimal to use one over another. But that is also not in the scope of this series. We'll be focused on the utilization of Terraform and its capabilities.

> **_Side-note:_** _**Vagrant**_ (another etymological mystery by the way) is also a powerful open-source tool from HashiCorp. It is a good idea to be familiar with this tool if you are interested in creating network infrastructure simulations for study labs or production implementation planning. It helps to make repeatable deployments way less time-consuming so we can focus more of our precious time on the actual task. It can be utilized in conjunction with netsim-tools, gns3, or eve-ng. This is also out of the scope of this series but worth exploring if you have the interest.

Now that we have an idea of what Terraform is and have a high-level understanding of its place in the world, let's close out this background part by setting the stage for the next one. We do that by briefly mentioning the lifecycle Terraform relies on to achieve infrastructure goals.

Terraform lifecycle is composed of **init**, **plan**, **apply**, and **destroy** stages. There is a “write” stage at the beginning too but we’ll call that as "step 0" as the presence of a written code can be considered an implicit requirement for initialization.

- **init:** Terraform initializes the code to capture the requirements and prepares itself in a working directory.
- **plan:** Terraform reviews the configuration changes proposed and decides on whether to accept or reject them. It comes up with a plan of how to make it happen if it accepts the inputs.
- **apply:** If infrastructure changes are accepted, Terraform apply executes them against the infrastructure.
- **destroy:** Terraform destroys infrastructure components marked for such action if instructed to do so.

This is an introduction and sets us up to begin an exciting journey in the world of Terraform. In future posts, we'll discuss the concepts, technical ideas, and implementation steps that make it such a valuable tool.

See you on the next one.
