---
title: "OSPF Prefix-Suppression"
date: "2023-01-17"
categories: 
  - "valarnet"
tags: 
  - "ospf"
---

OSPF prefix-suppression is a feature used to reduce the number of LSAs that are flooded within an area. This helps reduce the number of Type-1 (Router) and Type-2 (Network) LSAs advertised. 

It does not suppress Type-3 (Summary), Type-4 (Summary ASBR), Type 5  (External) or Type 7 (NSSA External) LSAs.

Fewer number of LSAs means SPF calculation can become faster. 

OSPF prefix-suppression can be enabled globally on a router or on per interface basis.

A use-case for OSPF prefix-suppression might be if communication is only expected between end hosts. In this case, advertising the transit links between the routers to all routers is not needed.

Enabling prefix-suppression globally on a router:
```md
router ospf 1
	prefix-suppression
```

Enabling prefix-suppression on per-interface basis:
```md
interface Gi0/0
	ip ospf prefix-suppression
```

Verification:
```
show ip ospf database router
show ip ospf database network
show ip route
```

**Further Reading:**

- [OSPF Prefix-Suppression](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/213404-open-shortest-path-first-prefix-suppress.html)