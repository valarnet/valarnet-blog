---
title: "BGP TCP Session Initiation Control"
date: "2023-02-15"
categories: 
  - "valarnet"
tags: 
  - "bgp"
--- 

It is possible to control which router initiates a BGP session request and which one passively waits to hear from the other.

```md
R1(config)#router bgp 100
R1(config-router)#neighbor 192.168.12.2 transport ?
  connection-mode     Specify passive or active connection
  multi-session       Use Multi-session for transport
  path-mtu-discovery  Use transport path MTU discovery
```

For a simple topology with two routers R1 & R2, "**transport connection-mode**" can be configured to make R1 active and R2 passive.

```md
R1
router bgp 100
 neighbor 192.168.12.2 remote-as 100
 neighbor 192.168.12.2 transport connection-mode active
```

R2 waits passively to hear from the peer.
```md
R2
router bgp 100
 neighbor 192.168.12.1 remote-as 100
 neighbor 192.168.12.1 transport connection-mode passive
```

R1 acts as the TCP client and  R2 as the server listening on TCP port 179. 

To validate the session establishment:
```md
R1#show tcp brief
TCB       Local Address               Foreign Address             (state)
11029800  192.168.12.1.47867           192.168.12.2.179              ESTAB
```

The "**transport multi-session**" option enables BGP capability to form multiple TCP sessions between neighbors where there is only one neighbor statement. It is relevant when Multi Topology Routing (MTR) is a required use-case.

##### Further Reading
- <a href="https://community.cisco.com/t5/service-providers-knowledge-base/bgp-multisession/ta-p/3128005" target="_blank">BGP Multisession</a>
