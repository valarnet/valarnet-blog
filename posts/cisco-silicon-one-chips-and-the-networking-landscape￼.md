---
title: "Cisco Silicon One Chips and the Networking Landscape￼"
date: "2022-06-18"
categories: 
  - "valarnet"
tags: 
  - "cisco"
---

From this year’s Cisco Live 2022, two announcements (both in the data center space) caught my attention.

**CLOUD-MANAGED**

The first is Cisco’s mention of plans to make the Cisco Nexus product line manageable from the Cloud as one already does the Meraki product line. This is interesting enough on its own. But there was another as well.

**MOARRR BANDWIDTH**

The other attention-catching event was that Cisco rolled out new Nexus data center switches that deliver 400Gb Ethernet. To make things more intriguing Cisco says 800GbE is in the works and will be on offer soon. What made this possible is the Cisco launched (March 2021) Silicon One G100 switching processor with 25.6Tbps, full-duplex, standalone, or fabric element configuration mode options.

With Silicon One, Cisco is driving towards providing a single architecture approach to the many product lines it brings to market. This is not only among equipment types such as switches, routers, and even wireless access points, but also across industry areas: enterprise, service provider, and web-scale data centers.

The newer Cisco 8000 router models, the Catalyst 9500X series and the Nexus 9300/9400 are some of the products already in the Silicon One product family.

**ONE ARCHITECTURE - HOW?**

One of Cisco's tag lines says "One architecture. Multiple devices. No compromises." Whenever I read these kinds of statements that sound too good to be true is when my skeptical engineer's antenna gets activated.

A question comes up in mind: ASIC has “application-specific” in its name. So how is a unified architecture going to work for multiple types of devices which provide different purposes? One routes, another switches, and another performs wireless functions. Switches typically come with higher port density while routers with lower.

For instance, take the Q200 and Q200L Silicon One modeled processors. The Q200 is a routing processor. The Q200L is a switching processor. Then where do the similarities end and the differences begin?

There's a shortage of details out there on how exactly this is achieved at lower levels, but Cisco qualifies what it means by **one architecture**: "... one architecture doesn’t mean one device, or one implementation of key functionality (e.g., Traffic Manager). What we mean by one architecture is there is a consistent language and work partitioning between different functions across the switching and routing devices."

What this statement makes clear is that there is an optimization process for each line of products depending on the areas it is required to excel. This is both on hardware (transistors and so on) and on a software level (P4-programming). Cisco says it relies on two pillars for this: a Network Processing Unit (NPU) and the Traffic Manager architectures.

The Network Processing Unit architecture – how it is built and programmed - determines the capabilities for features such as NAT, QinQ, SVL, Cisco TrustSec, and others.

The other pillar Cisco says it relies on is the Traffic Manager architecture. According to Cisco, this is what enables Silicon One to provide high-performance buffer utilization "while simplifying queueing and scheduling functions."

**RELEVANCE FOR IMPLEMENTATION ENGINEERS**

First, these newer technologies promise higher bandwidth and performances than their predecessors. This can be an attractive factor based on fit to the business problems looking to be solved.

Second, a unified architecture means fewer models to juggle through in the field. This should offer a common deployment and implementation engineering experience. This is when choosing among products and what used to be called “supervisor engine” options with different merchant class ASICs out there. The Silicon One models also promise deeper buffers which makes it exciting to see how it could play out when planning QoS which often requires paying attention to the ASIC architectures.

Third, it means this may offer an opportunity to standardize the programmability approaches to these devices even further. The running OS matters a great deal in this respect too but having a shared baseline architecture can only streamline rather than get in the way of such efforts.

Additionally, the devices utilizing the Silicon One architecture are being positioned as more energy efficient. It would be great if comparative charts and tests are made available if they haven’t already.

It will be interesting to follow how this unified architecture approach progresses and affects the networking landscape across multiple industries.

**Additional Reading**

- [Cisco Silicon One](https://www.cisco.com/c/en/us/solutions/silicon-one.html)
- [Cisco Silicon One Powers the Next-Generation Enterprise Switches](https://blogs.cisco.com/sp/cisco-silicon-one-powers-the-next-generation-enterprise-switches)
- [Cisco Silicon One Product Family](https://www.cisco.com/c/dam/en/us/solutions/collateral/silicon-one/white-paper-sp-product-family.pdf)
- [Cisco Silicon One G100 Data Sheet](https://www.cisco.com/c/en/us/solutions/collateral/silicon-one/datasheet-c78-744833.html)
- [Cisco data-center switches promise 800Gb Ethernet, deliver 400GbE today](https://www.networkworld.com/article/3663703/cisco-data-center-switches-promise-800gb-ethernet-deliver-400gbe-today.html)
