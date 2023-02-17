---
title: "Passive Interface - RIP, EIGRP, OSPF"
date: "2023-02-17"
categories: 
  - "valarnet"
tags: 
  - "eigrp"
  - "ospf"
--- 

Sometimes a quick trip back to the basics is just what's needed.

##### RIPv2
- Passive-interface does not send multicast updates out that interface.
- Passive-interface can still receive route updates incoming on the interface from other RIP speakers.
- If looking to use "nieghbor" statement, both unicast and multicast updates are sent. Using passive interface on the interface ensures only unicasts are sent.

##### EIGRP
- Passive-interface stops outgoing Hello packets.  The interface also ignores incoming Hello packets. Therefore, neighborship cannot be formed.
- Inability to form neighborship over a passive interface means no route updates can be sent or learned over the interface.
- To stop sending routing updates but still be able to receive them, use distribute list in the outbound direction. A formed neighborship has to be on the other side. Therefore, the interface cannot be passive.
- If looking to use "neighbor" statement to unicast EIGRP Hellos, the "neighbor" command must be configured on both adjacent routers. This is because EIGRP stops the processing of multicast packets on the interface when the neighbor command is issued.

```md
%DUAL-5-NBRCHANGE: EIGRP-IPv4 1: Neighbor 192.168.12.1 (GigabitEthernet0/0) is down: Static peer replaces multicast
```
##### OSPF
- Passive-interface stops the sending of Hello packets on the interface. Therefore, adjacency cannot be  formed on a passive interface.
- Without a formed adjacency, routing updates cannot be sent or received via an interface.
- As long as the OSPF process is enabled on the interface either directly or via a network statement, the connected network address of the interface where passive interface is configured is still advertised into the OSPF domain.
- The "neighbor" command can only be used on Nonbroadcast Multi Access (NBMA) and Point-to-Multipoint (P2MP) OSPF networks. Configuring the "neighbor" command only on one side is sufficient. Passive interface suppresses the sending of unicast Hello packets as well. 
