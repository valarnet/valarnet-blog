---
title: "Part 2: Terraform - The Fundamentals"
date: "2022-05-21"
categories: 
  - "valarnet"
tags: 
  - "terraform"
---

This is a continuation of [the first part](/posts/getting-started-with-terraform-background/) in this series where we outlined why Terraform exists and what it does.

In this part of the series, we discuss:

- [Workspaces](#Workspaces)
- [Backends and the idea of storing state](#Backends)
- [The Terraform Lifecycle](#Terraform-Lifecycle)
    - [Write](#Write)
        - [Working directory](#Working-Directory)
    - [Init](#Init)
    - [Plan](#Plan)
    - [Apply](#Apply)
    - [Destroy](#Destroy)
- [Terraform Basic Architecture](#Terraform-Architecture)
    - [Plugins](#Plugins)
        - [Providers](#Providers)
        - [Provisioners](#Provisioners)
    - [Terraform Core](#Terraform-Core)

**Workspaces**

Let's take a little detour and briefly talk about operating systems. If you are a MacOS or Linux user, you're probably already familiar with the concept of workspaces.

Workspaces are a way of creating logical isolation. The windows and applications you run in one workspace will not show up in another. Each workspace continues to maintain its own separate state.

![](/static/img/image.png?w=1012)

As you read, keep in mind that if/when needed Terraform can employ a somewhat similar concept of workspaces to provide isolation between separate instances of state data.

**Backends**

Another concept to be familiar with to grasp how Terraform works is the topic of **backend**. We have repeatedly stated that Terraform relies on understanding the _current state_ and executing what needs to be done to get to the _desired state_. Where then does it store the current state information? This is where **backends** come in to play.

Backends can be local or remote. Backends are used to store persistent state data that allows Terraform to keep track of infrastructure resources. The state data is what serves as Terraform's source-of-truth. By default, Terraform uses the **local** backend.

In later parts of this series, we will see how to modify backend location and enable collaboration among teams working on the same project. That's one exciting stuff ahead.

**The Terraform Lifecycle**

Pictorially, the terraform lifecycle looks as shown here.

![](/static/img/image-1.png?w=1024)

**What happens during each stage of the lifecycle?**

**0\. Write**

You, as the infrastructure coder, write code using the HashiCorp Configuration Language (HCL). You save this configuration file in a directory of your choice with a **.tf** file extension. This directory is referred to as a working directory.

In this configuration file, you declare what you need to see happen. You do not have to list out the steps for how to get it done. Terraform is declarative and will map out a path for how to accomplish the ask. Later on, we'll learn the syntax and how to write these configuration files.

What is a working directory and why do we need it?

- It is where our configuration files are stored.
- It is required for Terraform to execute any operations.
- It hosts a hidden directory **.terraform** which caches _provider plugins_ & modules, keeps a record of which _workspace_ is currently active, and records the last known _backend_ configuration. The **.terraform** hidden directory will be prepared during the init stage.  We'll elaborate what provider plugins are as we go further.
- The working directory can hold state data if we are using the default **local** backend. We store this state data either in a **terraform.tfstate** file (if using only the default workspace) or inside a **terraform.tfstate.d** directory if we have defined multiple workspaces. if we're using a remote backend location, the state data will not be in the working directory.

**1\. Init**

Here you invoke **terraform init** command in the working directory that contains configuration files. This invocation triggers Terraform to prepare the hidden .terraform directory we mentioned above, instructs it to download and install required provider plugins and modules, and to locate the backend configuration file for state information.

**2\. Plan**

When you issue the **terraform plan** command, Terraform starts preparing an execution plan. It looks at the state information it accessed from the backend in the **init** stage, reads through what the configuration file is asking it to do, compares what is being asked with the prior state information, then proposes changes that need to be applied. It does not execute these changes but lets you know what it proposes.

This is a step where you need to be paying extra attention to what is being proposed to you, especially if you are going to apply these changes in production environments. You do not want to bring down the house.

**3\. Apply**

Now that there is a plan of execution, it is up to you as the infrastructure manager to review and understand what is being proposed. If you are comfortable with the proposals, you issue **terraform apply** command and permit Terraform to start executing according to the plan.

At this stage, additions, modifications, or deletions occur to transform the infrastructure from its current state to the desired state. Terraform does this by making actual use of the provider plugins and modules it downloaded in the **init** stage.

**4\. Destroy**

If you are like [the joker](https://www.youtube.com/watch?v=wbbz9ccZks8), you'll find this to be the most fun of the stages. This is where we tell Terraform to destroy infrastructure resources by issuing a **terraform destroy** command. This may be for whatever reason - the infrastructure has served its purpose, is being decommissioned, or it hasn't met the build requirements, etc. More on this later.

**Terraform Basic Architecture**

The basic architecture diagram below encapsulates the components involved and the actions we outlined above in the different stages of the Terraform lifecycle.

![](/static/img/image-2.png?w=1024)

**Plugins:** These are the components that enable Terraform to interact with cloud providers, SaaS providers, and APIs.

The most popular and recommended plugin types to use are called _providers_. Yes, the wording can be confusing. So, watch closely for the context in which the word "provider" is used to determine if it is referring to the Terraform technical meaning or the ordinary English meaning. 

Providers must be declared in Terraform configuration files. These providers are what add a set of resource types or data sources Terraform can manage. If there are no providers declared, Terraform cannot manage any infrastructure at all.

We're not yet in to the coding sections but just to clear out any confusion here, consider the following snippet of code. This declares the provider resource types to be used are Google's.
```hcl
provider "google" {
    project = mastering-terraform
    region = us-east1
}
```
As you can tell from the basic architecture diagram above, providers are distributed separately and we do not get them just by downloading Terraform. We have to look for them from the vendors themselves and follow their release schedule to get the updates. This is why they're considered plugins.

**Provisioners** are types of plugins that are included in the design of Terraform as a hedge. The hedge is that "what if there are scenarios that do not typically lend themselves to the declarative model?" Provisioners are included to be used in handling corner cases and as such, they are not meant to be utilized often.

**Terraform Core**

It is a clichéd expression but Core is the "brain" of Terraform that controls its working logic.

In **init** stage, Terraform Core downloads (among other tasks) required plugins based on the configuration file. In **plan** stage, this is the component that takes in the configuration file, pulls in state data from a backend location, compares the desire versus the current state, and proposes an execution plan. In **apply** stage, Terraform Core makes use of plugins, and executes the planned changes on to infrastructure environments, and modifies the state file to reflect the change in state.

In the next part of this series, we'll get started with writing configuration files by installing Terraform.
