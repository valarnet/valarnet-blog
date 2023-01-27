---
title: "OSPF Distribute List"
date: "2023-01-26"
categories: 
  - "valarnet"
tags: 
  - "ospf"
---

OSPF traffic engineering is one of those areas where the same kind of thought process utilized for other protocols like EIGRP and BGP just won't do. 

EIGRP neighbors exchanges routes. BGP peers advertise NLRIs to each other. The route calculations made on one router and the decisions made locally influence the proceeding router's behavior. 

OSPF is a link state routing protocol. That means it never advertises routes. Routers only advertise LSAs describing their view of the network. Each router in an area sends out LSAs to its adjacent. In the case of multi-access networks, to reduce the number of LSAs,  the designated router assumes the role of LSA advertisement using particular types of LSAs. 

Below is the topology we'll be using for this post.

![](/static/img/ospf-topology.png)

In this simple topology,  all four routers and every one of their interfaces live in area 0. The routers form OSPF adjacency with directly connected peers in area 0.

R1
```md
R1#sh ip ospf nei

Neighbor ID     Pri   State           Dead Time   Address         Interface
4.4.4.4           1   FULL/BDR        00:00:31    10.1.14.4       GigabitEthernet0/1
3.3.3.3           1   FULL/BDR        00:00:32    10.1.13.3       GigabitEthernet0/0
```

R2
```md 
R2#sh ip ospf nei

Neighbor ID     Pri   State           Dead Time   Address         Interface
4.4.4.4           1   FULL/BDR        00:00:36    10.1.24.4       GigabitEthernet0/1
3.3.3.3           1   FULL/BDR        00:00:34    10.1.23.3       GigabitEthernet0/0
```

By default, OSPF uses ECMP. If two routes with the same SPF cost are available, both are installed and carry traffic load equally. 

With this basic setup, traffic from R4's loopback to R3's loopback will follow path both via R1 10.1.14.1 next hop and R2 10.1.24.2 next hop.

```md
R4#show ip route ospf
~output omitted~~
      1.0.0.0/32 is subnetted, 1 subnets
O        1.1.1.1 [110/2] via 10.1.14.1, 00:13:54, GigabitEthernet0/0
      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/2] via 10.1.24.2, 00:13:54, GigabitEthernet0/1
      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/3] via 10.1.24.2, 00:13:54, GigabitEthernet0/1
                 [110/3] via 10.1.14.1, 00:13:54, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
O        10.1.13.0/24 [110/2] via 10.1.14.1, 00:13:54, GigabitEthernet0/0
O        10.1.23.0/24 [110/2] via 10.1.24.2, 00:13:54, GigabitEthernet0/1
```


##### ***But what if we wanted to influence R4 to only use the path via R1 and not R2 without modifying the bandwidth or cost of any link on any router?**

R2's LSDB shows the following:
```md
R2#show ip ospf database

            OSPF Router with ID (2.2.2.2) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         1454        0x80000005 0x000F8C 3
2.2.2.2         2.2.2.2         1455        0x80000005 0x00E979 3
3.3.3.3         3.3.3.3         1472        0x80000006 0x00EE7C 3
4.4.4.4         4.4.4.4         1441        0x80000005 0x007BDE 3

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
10.1.13.1       1.1.1.1         1489        0x80000001 0x0012FA
10.1.14.1       1.1.1.1         1454        0x80000001 0x0039CE
10.1.23.2       2.2.2.2         1485        0x80000001 0x009D5C
10.1.24.2       2.2.2.2         1455        0x80000001 0x00C430
```

R2's OPSF RIB also shows that the 3.3.3.3/32 is marked as best (>) and installed in the global RIB.
```md
R2#sh ip ospf rib

            OSPF Router with ID (2.2.2.2) (Process ID 1)


		Base Topology (MTID 0)

OSPF local RIB
Codes: * - Best, > - Installed in global RIB

*>  1.1.1.1/32, Intra, cost 3, area 0
      via 10.1.24.4, GigabitEthernet0/1
      via 10.1.23.3, GigabitEthernet0/0
*   2.2.2.2/32, Intra, cost 1, area 0, Connected
      via 2.2.2.2, Loopback0
*>  3.3.3.3/32, Intra, cost 2, area 0
      via 10.1.23.3, GigabitEthernet0/0
*>  4.4.4.4/32, Intra, cost 2, area 0
      via 10.1.24.4, GigabitEthernet0/1
*>  10.1.13.0/24, Intra, cost 2, area 0
      via 10.1.23.3, GigabitEthernet0/0
*>  10.1.14.0/24, Intra, cost 2, area 0
      via 10.1.24.4, GigabitEthernet0/1
*   10.1.23.0/24, Intra, cost 1, area 0, Connected
      via 10.1.23.2, GigabitEthernet0/0
*   10.1.24.0/24, Intra, cost 1, area 0, Connected
      via 10.1.24.2, GigabitEthernet0/1
```

Since all four routers must have the same view of the LSDB in area 0, there is no option to filter the advertisement of LSAs. Also, there are no ABRs or ASBRs in this topology, all routers are in the same area and running the same OSPF routing protocol.

A detailed look of the router LSA for 3.3.3.3 on R2 shows

```md
R2#sh ip ospf database router 3.3.3.3

            OSPF Router with ID (2.2.2.2) (Process ID 1)

		Router Link States (Area 0)

  LS age: 1915
  Options: (No TOS-capability, DC)
  LS Type: Router Links
  Link State ID: 3.3.3.3
  Advertising Router: 3.3.3.3
  LS Seq Number: 80000006
  Checksum: 0xEE7C
  Length: 60
  Number of Links: 3

    Link connected to: a Stub Network
     (Link ID) Network/subnet number: 3.3.3.3
     (Link Data) Network Mask: 255.255.255.255
      Number of MTID metrics: 0
       TOS 0 Metrics: 1

    Link connected to: a Transit Network
     (Link ID) Designated Router address: 10.1.23.2
     (Link Data) Router Interface address: 10.1.23.3
      Number of MTID metrics: 0
       TOS 0 Metrics: 1

    Link connected to: a Transit Network
     (Link ID) Designated Router address: 10.1.13.1
     (Link Data) Router Interface address: 10.1.13.3
      Number of MTID metrics: 0
       TOS 0 Metrics: 1

```

We can attempt applying a distribute list on R2 to deny the route to 3.3.3.3/32 from being installed in the OSPF RIB. Doing this does not affect the OSPF LSDB as this LSA will, as it should, continue to be visible from R2's perspective. 
```md
access-list 1 deny 3.3.3.3
access-list 1 permit any
router ospf 1
  distribute-list 1 in
```

Viewing the OSPF RIB again shows that the 3.3.3.3/32 route no longer has the > sign. 
```md
R2#sh ip ospf rib

            OSPF Router with ID (2.2.2.2) (Process ID 1)


		Base Topology (MTID 0)

OSPF local RIB
Codes: * - Best, > - Installed in global RIB

*>  1.1.1.1/32, Intra, cost 3, area 0
      via 10.1.24.4, GigabitEthernet0/1
      via 10.1.23.3, GigabitEthernet0/0
*   2.2.2.2/32, Intra, cost 1, area 0, Connected
      via 2.2.2.2, Loopback0
*   3.3.3.3/32, Intra, cost 2, area 0
      via 10.1.23.3, GigabitEthernet0/0
*>  4.4.4.4/32, Intra, cost 2, area 0
      via 10.1.24.4, GigabitEthernet0/1
*>  10.1.13.0/24, Intra, cost 2, area 0
      via 10.1.23.3, GigabitEthernet0/0
*>  10.1.14.0/24, Intra, cost 2, area 0
      via 10.1.24.4, GigabitEthernet0/1
*   10.1.23.0/24, Intra, cost 1, area 0, Connected
      via 10.1.23.2, GigabitEthernet0/0
*   10.1.24.0/24, Intra, cost 1, area 0, Connected
      via 10.1.24.2, GigabitEthernet0/1
```

On R2, the route to 3.3.3.3/32 is no longer selected as best route and is not installed in the routing table.
```md
R2#show ip route ospf
~output omitted~

      1.0.0.0/32 is subnetted, 1 subnets
O        1.1.1.1 [110/3] via 10.1.24.4, 00:01:43, GigabitEthernet0/1
                 [110/3] via 10.1.23.3, 00:01:43, GigabitEthernet0/0
      4.0.0.0/32 is subnetted, 1 subnets
O        4.4.4.4 [110/2] via 10.1.24.4, 00:01:43, GigabitEthernet0/1
      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
O        10.1.13.0/24 [110/2] via 10.1.23.3, 00:01:43, GigabitEthernet0/0
O        10.1.14.0/24 [110/2] via 10.1.24.4, 00:01:43, GigabitEthernet0/1
```

Comparing the OSPF database output with the previous one shows that all still looks unchanged.
```md
R2#show ip ospf database

            OSPF Router with ID (2.2.2.2) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         1803        0x80000005 0x000F8C 3
2.2.2.2         2.2.2.2         1804        0x80000005 0x00E979 3
3.3.3.3         3.3.3.3         1821        0x80000006 0x00EE7C 3
4.4.4.4         4.4.4.4         1790        0x80000005 0x007BDE 3

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
10.1.13.1       1.1.1.1         1838        0x80000001 0x0012FA
10.1.14.1       1.1.1.1         1803        0x80000001 0x0039CE
10.1.23.2       2.2.2.2         1834        0x80000001 0x009D5C
10.1.24.2       2.2.2.2         1804        0x80000001 0x00C430
```

Let's now check if R4's view of the routing table has changed in any way. It hasn't. Each router in the OSPF area performs its own SPF calculation based on the its view of the LSDB. For path calculation to destinations **in the same area**, *because somebody else told me so* doesn't work.

> **Note:** The phrase "in the same area" is key above. If the destinations were in another OSPF area under the same process or another routing domain altogether (i.e., external or a different OSPF process), ABRs and ASBRs would have the power to influence how other routers make their decisions.

R4 (erroneously) still operates as if it has valid redundant paths to 3.3.3.3/32 via both R1 and R2. 
```md
R4#sh ip route ospf
~output omitted~

      1.0.0.0/32 is subnetted, 1 subnets
O        1.1.1.1 [110/2] via 10.1.14.1, 00:38:45, GigabitEthernet0/0
      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/2] via 10.1.24.2, 00:38:45, GigabitEthernet0/1
      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/3] via 10.1.24.2, 00:38:45, GigabitEthernet0/1
                 [110/3] via 10.1.14.1, 00:38:45, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
O        10.1.13.0/24 [110/2] via 10.1.14.1, 00:38:45, GigabitEthernet0/0
O        10.1.23.0/24 [110/2] via 10.1.24.2, 00:38:45, GigabitEthernet0/1

```

However, since a distribute list has been applied on R2, half of the traffic R4 sends to R3's loopback will end up being blackholed at R2.
```md
R4#ping 3.3.3.3 so lo0 repeat 10
Type escape sequence to abort.
Sending 10, 100-byte ICMP Echos to 3.3.3.3, timeout is 2 seconds:
Packet sent with a source address of 4.4.4.4
U.U.U.U.U.
Success rate is 0 percent (0/10)
```

If this were in either EIGRP or BGP, it wouldn't have been a major issue since those protocols rely on the exchange of routes or prefixes. Decisions made on R2 would have affected R4's behavior. But not in OSPF. So, distribute lists are things to use with caution in OSPF. Multiple devices in the same area may need to be configured with similar distribute list configurations to achieve the same traffic path outcome EIGRP and BGP achieve in a more straightforward manner.
