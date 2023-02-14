---
title: "OSPF Discontiguous Backbone Area"
date: "2023-02-14"
categories: 
  - "valarnet"
tags: 
  - "ospf"
--- 

**How does OSPF deal with a discontiguous backbone area?**

Consider the following topology.

![](/static/img/ospf-discontiguous-area0.png)

R1 and R2 are Area Border Routers (ABRs) with interfaces in both area 0 and area 1. Both the physical and loopback interfaces of R3 are in area 0. R4 has a single interface in area 0 and a loopback interface that is redistributed into OSPF.

Area 0 in this topology is not contiguous. All link-state updates sent from R3 will have to cross over the non-backbone area 1 between  R1 and R2 in order to reach R4. Similarly, all link-state updates sent by R4 will need to cross over the non-backbone area 1 between R1 and R2 in order to reach R3.

All required OSPF adjacencies have been formed using basic settings in OSPF process 1. The loopback of R4 has been redistributed into OSPF.
```md
R1#sh ip ospf nei

Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.13.3      1   FULL/BDR        00:00:32    192.168.13.3    GigabitEthernet0/1
192.168.12.2      1   FULL/BDR        00:00:33    192.168.12.2    GigabitEthernet0/0
```

```md
R2#sh ip ospf nei

Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.24.4      1   FULL/BDR        00:00:32    192.168.24.4    GigabitEthernet0/1
192.168.12.1      1   FULL/DR         00:00:34    192.168.12.1    GigabitEthernet0/0
```

R1 and R2 are ABRs. 
```md
R1#sh ip ospf | i router
 It is an area border router
 Router is not originating router-LSAs with maximum metric
 Number of areas in this router is 2. 2 normal 0 stub 0 nssa
```

```md
R2#sh ip ospf | i router
 It is an area border router
 Router is not originating router-LSAs with maximum metric
 Number of areas in this router is 2. 2 normal 0 stub 0 nssa
```

R4 is an ASBR.
```md
R4#sh ip ospf | i router
 It is an autonomous system boundary router
 Router is not originating router-LSAs with maximum metric
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa
```

**How does OSPF behave as this configuration stands?**

Let's check R3's OSPF LSDB. Notice that the link between R2 and R4 (192.168.24.0/24) is not learned by R3. However, R3 learns the loopback of R4 4.4.4.4/32 as an external LSA.

```md
R3#sh ip ospf database

            OSPF Router with ID (192.168.13.3) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.1    192.168.12.1    1056        0x80000004 0x00341F 1
192.168.13.3    192.168.13.3    1044        0x80000005 0x004CE1 2

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.13.1    192.168.12.1    1056        0x80000001 0x00F269

		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.0    192.168.12.1    1284        0x80000001 0x00F659

		Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
4.4.4.4         192.168.24.4    959         0x80000001 0x0062A8 0
```

Looking into the details of the external LSA shows that it is advertised by R4 (OSPF router ID 192.168.24.4)
```md
R3#sh ip ospf database external 4.4.4.4

            OSPF Router with ID (192.168.13.3) (Process ID 1)

		Type-5 AS External Link States

  LS age: 1628
  Options: (No TOS-capability, DC, Upward)
  LS Type: AS External Link
  Link State ID: 4.4.4.4 (External Network Number )
  Advertising Router: 192.168.24.4
  LS Seq Number: 80000001
  Checksum: 0x62A8
  Length: 36
  Network Mask: /32
	Metric Type: 2 (Larger than any link state path)
	MTID: 0
	Metric: 20
	Forward Address: 0.0.0.0
	External Route Tag: 0
```
However, checking in R3's routing table shows that a 4.4.4.4/32 route is not installed in the RIB.
```md
R3#sh ip route | b Gateway
Gateway of last resort is not set

      3.0.0.0/32 is subnetted, 1 subnets
C        3.3.3.3 is directly connected, Loopback0
O IA  192.168.12.0/24 [110/2] via 192.168.13.1, 00:20:00, GigabitEthernet0/0
      192.168.13.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.13.0/24 is directly connected, GigabitEthernet0/0
L        192.168.13.3/32 is directly connected, GigabitEthernet0/0
```

R3's OSPF RIB also doesn't show anything about R4's Lo0 4.4.4.4/32. 
```md
R3#sh ip ospf rib

            OSPF Router with ID (192.168.13.3) (Process ID 1)


		Base Topology (MTID 0)

OSPF local RIB
Codes: * - Best, > - Installed in global RIB

*   3.3.3.3/32, Intra, cost 1, area 0, Connected
      via 3.3.3.3, Loopback0
*>  192.168.12.0/24, Inter, cost 2, area 0
      via 192.168.13.1, GigabitEthernet0/0
*   192.168.13.0/24, Intra, cost 1, area 0, Connected
      via 192.168.13.3, GigabitEthernet0/0
```

**An important rule in OSPF is that ABRs do not take into SPF calculation consideration LSAs received over a non-backbone area.**

Therefore, both R4's Lo0 4.4.4.4/32, which was redistributed into OSPF, and the route for the link between R2 and R4 (192.168.24.0/24) are not available for R3 to use. In fact, an LSA for the latter (192.168.24.0/24) does not even appear in R3's view.

Before we get to configuration modifications, let's check how R4 sees the topology from its perspective.
R4's LSDB shows that it is not receiving any LSA about R3's Lo0 3.3.3.3/32. R4 also has no knowledge of the link between R1 and R3 (192.168.13.0/24).
```md
R4#sh ip ospf database

            OSPF Router with ID (192.168.24.4) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.2    192.168.12.2    384         0x80000005 0x002D0B 1
192.168.24.4    192.168.24.4    371         0x80000005 0x0053C5 1

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.24.2    192.168.12.2    384         0x80000002 0x000F32

		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.0    192.168.12.2    628         0x80000002 0x00EE5F

		Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
4.4.4.4         192.168.24.4    371         0x80000002 0x0060A9 0
```

Finally, let's look at R1 and R2's views of the topology. These are our two Area Border Routers and we expect them to see a lot more.

R1's LSDB:
```md
R1#sh ip ospf database

            OSPF Router with ID (192.168.12.1) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.1    192.168.12.1    600         0x80000005 0x003220 1
192.168.13.3    192.168.13.3    632         0x80000006 0x004AE2 2

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.13.1    192.168.12.1    600         0x80000002 0x00F06A

		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.0    192.168.12.1    849         0x80000002 0x00F45A

		Router Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.1    192.168.12.1    849         0x80000004 0x001E37 1
192.168.12.2    192.168.12.2    767         0x80000004 0x001C36 1

                Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.1    192.168.12.1    849         0x80000002 0x00E07D

		Summary Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
3.3.3.3         192.168.12.1    600         0x80000002 0x00AA0D
192.168.13.0    192.168.12.1    849         0x80000002 0x00E964
192.168.24.0    192.168.12.2    767         0x80000002 0x006AD7

		Summary ASB Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.24.4    192.168.12.2    523         0x80000002 0x003409

		Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
4.4.4.4         192.168.24.4    512         0x80000002 0x0060A9 0
```

Our ABR R1's routing table shows that it is not installing neither the 192.168.24.0/24 nor the 4.4.4.4/32 routes since it learned about them over the non-backbone area 1.
```md
R1#sh ip route | b Gateway
Gateway of last resort is not set

      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/2] via 192.168.13.3, 00:45:40, GigabitEthernet0/1
      192.168.12.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.12.0/24 is directly connected, GigabitEthernet0/0
L        192.168.12.1/32 is directly connected, GigabitEthernet0/0
      192.168.13.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.13.0/24 is directly connected, GigabitEthernet0/1
L        192.168.13.1/32 is directly connected, GigabitEthernet0/1
```
R2's LSDB:
```md
R2#sh ip ospf database

            OSPF Router with ID (192.168.12.2) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.2    192.168.12.2    606         0x80000005 0x002D0B 1
192.168.24.4    192.168.24.4    595         0x80000005 0x0053C5 1

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.24.2    192.168.12.2    606         0x80000002 0x000F32

		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.0    192.168.12.2    850         0x80000002 0x00EE5F

		Router Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.1    192.168.12.1    934         0x80000004 0x001E37 1
192.168.12.2    192.168.12.2    850         0x80000004 0x001C36 1

		Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.1    192.168.12.1    934         0x80000002 0x00E07D

		Summary Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
3.3.3.3         192.168.12.1    685         0x80000002 0x00AA0D
192.168.13.0    192.168.12.1    934         0x80000002 0x00E964
192.168.24.0    192.168.12.2    850         0x80000002 0x006AD7

		Summary ASB Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.24.4    192.168.12.2    606         0x80000002 0x003409

		Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
4.4.4.4         192.168.24.4    595         0x80000002 0x0060A9 0
```

Similarly, R2 does not install the 192.168.13.0/24 as well as the 3.3.3.3/32 routes it learned over the non-backbone area 1. 
```md
R2#sh ip route | b Gateway
Gateway of last resort is not set

      4.0.0.0/32 is subnetted, 1 subnets
O E2     4.4.4.4 [110/20] via 192.168.24.4, 00:45:36, GigabitEthernet0/1
      192.168.12.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.12.0/24 is directly connected, GigabitEthernet0/0
L        192.168.12.2/32 is directly connected, GigabitEthernet0/0
      192.168.24.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.24.0/24 is directly connected, GigabitEthernet0/1
L        192.168.24.2/32 is directly connected, GigabitEthernet0/1
```

***What are some of the options we can attempt to resolve this issue and allow the routers to use the LSAs they already learn.***

- **Option 1:** Add a link between R1 and R2 in Area 0 to make the backbone contiguous. This should be pretty straightforward. But in some cases there may be physical restrictions that prohibit us from doing so.
- **Option 2:** Build a virtual link over Area 1 to make the backbone contiguous. If R1 was a stub or non-transit area, we would not be able to implement this option.
- **Option 3**: Build a GRE tunnel between R1 and R2 with tunnel interfaces placed in Area 0. There's not only configuration overhead and risk of intermittency with tunnels, but data plane overhead when it comes to tunnels.
- **Option 4**: Use multi-area adjacency on the link between R1 and R2. **OSPF Multi-area adjacency** is a feature that allows OSPF to run separate adjacencies in multiple areas over the same physical link. A key requirement to use the multi-area adjacency feature is the link has to be an **OSPF point-to-point** network type. 

We'll try Option 4 and configure multi-area adjacency.

Let's see verify details of the adjacency between R1 and R2 before we make the change.
```md
R1#show ip ospf nei 192.168.12.2
 Neighbor 192.168.12.2, interface address 192.168.12.2
    In the area 1 via interface GigabitEthernet0/0
    Neighbor priority is 1, State is FULL, 6 state changes
    DR is 192.168.12.1 BDR is 192.168.12.2
    Options is 0x12 in Hello (E-bit, L-bit)
    Options is 0x52 in DBD (E-bit, L-bit, O-bit)
    LLS Options is 0x1 (LR)
    Dead timer due in 00:00:38
    Neighbor is up for 00:53:57
    Index 1/1/1, retransmission queue length 0, number of retransmission 0
    First 0x0(0)/0x0(0)/0x0(0) Next 0x0(0)/0x0(0)/0x0(0)
    Last retransmission scan length is 0, maximum is 0
    Last retransmission scan time is 0 msec, maximum is 0 msec
```

If multi-area adjacency is configured on a link that is different from an OSPF point-to-point network, a logical multi-area interface (MA0) will be created but remains in DOWN state.

```md
R1#sh ip ospf int br
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
MA0          1     0               Unnumbered Gi0/0   1     DOWN  0/0
Gi0/1        1     0               192.168.13.1/24    1     DR    1/1
Gi0/0        1     1               192.168.12.1/24    1     BDR   1/1
```

Now we configure multi-area adjacency on R1 and R2 with OSPF point-to-point type network.
```md
R1
interface GigabitEthernet0/0
 ip address 192.168.12.1 255.255.255.0
 ip ospf network point-to-point
 ip ospf multi-area 0
 ip ospf 1 area 1
!

R2
interface GigabitEthernet0/0
 ip address 192.168.12.2 255.255.255.0
 ip ospf network point-to-point
 ip ospf multi-area 0
 ip ospf 1 area 1
```

The OSPF interface output shows that a logical MA0 interface is created and uses the Unnumbered mechanism to borrow IP address from the Gi0/0 interface. The state of the link is P2P.
```md
R1#show ip ospf int br
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
MA0          1     0               Unnumbered Gi0/0   1     P2P   1/1
Gi0/1        1     0               192.168.13.1/24    1     DR    1/1
Gi0/0        1     1               192.168.12.1/24    1     P2P   1/1
```
Now let's check the R1-R2 OSPF adjacency details again. We see two adjacencies between R1 and R2 over the same physical link. One adjaceny is in Area 0 over the OSPF_MA0 logical interface while another is formed in Area 1 over the Gi0/0 physical interface.
```md
R1#show ip ospf nei

Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.12.2      0   FULL/  -        00:00:39    192.168.12.2    OSPF_MA0
192.168.13.3      1   FULL/BDR        00:00:31    192.168.13.3    GigabitEthernet0/1
192.168.12.2      0   FULL/  -        00:00:36    192.168.12.2    GigabitEthernet0/0
```
```md
R1#show ip ospf nei 192.168.12.2
 Neighbor 192.168.12.2, interface address 192.168.12.2
    In the area 0 via interface OSPF_MA0
    Neighbor priority is 0, State is FULL, 6 state changes
    DR is 0.0.0.0 BDR is 0.0.0.0
    Options is 0x12 in Hello (E-bit, L-bit)
    Options is 0x52 in DBD (E-bit, L-bit, O-bit)
    LLS Options is 0x1 (LR)
    Dead timer due in 00:00:34
    Neighbor is up for 00:02:29
    Index 1/2/3, retransmission queue length 0, number of retransmission 0
    First 0x0(0)/0x0(0)/0x0(0) Next 0x0(0)/0x0(0)/0x0(0)
    Last retransmission scan length is 0, maximum is 0
    Last retransmission scan time is 0 msec, maximum is 0 msec
 Neighbor 192.168.12.2, interface address 192.168.12.2
    In the area 1 via interface GigabitEthernet0/0
    Neighbor priority is 0, State is FULL, 12 state changes
    DR is 0.0.0.0 BDR is 0.0.0.0
    Options is 0x12 in Hello (E-bit, L-bit)
    Options is 0x52 in DBD (E-bit, L-bit, O-bit)
    LLS Options is 0x1 (LR)
    Dead timer due in 00:00:31
    Neighbor is up for 00:02:29
    Index 1/1/1, retransmission queue length 0, number of retransmission 0
    First 0x0(0)/0x0(0)/0x0(0) Next 0x0(0)/0x0(0)/0x0(0)
    Last retransmission scan length is 0, maximum is 0
    Last retransmission scan time is 0 msec, maximum is 0 msec
```

Let's circle back to R3's LSDB and verify how (or if) this changes its view of the topology. We can now see that R3 has a lot more in its LSDB and sees more of the topology.
```md
R3#show ip ospf database

            OSPF Router with ID (192.168.13.3) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.1    192.168.12.1    257         0x80000009 0x00E7DD 2
192.168.12.2    192.168.12.2    65          0x80000007 0x00FDB0 2
192.168.13.3    192.168.13.3    145         0x80000007 0x0048E3 2
192.168.24.4    192.168.24.4    18          0x80000006 0x0051C6 1

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.13.1    192.168.12.1    120         0x80000003 0x00EE6B
192.168.24.2    192.168.12.2    65          0x80000003 0x000D33

		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.0    192.168.12.1    760         0x80000003 0x00F25B
192.168.12.0    192.168.12.2    308         0x80000003 0x00EC60

                Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
4.4.4.4         192.168.24.4    18          0x80000003 0x005EAA 0
```
Checking the route table on R3 shows that R3 now installs the R4 loopback as an O E2, the link between R1 & R2 as an O IA, and the link between R2 & R4 as an intra-area O route.
```md
R3#sh ip route | b Gateway
Gateway of last resort is not set

      3.0.0.0/32 is subnetted, 1 subnets
C        3.3.3.3 is directly connected, Loopback0
      4.0.0.0/32 is subnetted, 1 subnets
O E2     4.4.4.4 [110/20] via 192.168.13.1, 00:05:05, GigabitEthernet0/0
O IA  192.168.12.0/24 [110/2] via 192.168.13.1, 00:13:41, GigabitEthernet0/0
      192.168.13.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.13.0/24 is directly connected, GigabitEthernet0/0
L        192.168.13.3/32 is directly connected, GigabitEthernet0/0
O     192.168.24.0/24 [110/3] via 192.168.13.1, 00:05:05, GigabitEthernet0/0
```

R4 similarly has a more complete view of the topology.
```md
R4#show ip ospf database

            OSPF Router with ID (192.168.24.4) (Process ID 1)

		Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
192.168.12.1    192.168.12.1    422         0x80000009 0x00E7DD 2
192.168.12.2    192.168.12.2    228         0x80000007 0x00FDB0 2
192.168.13.3    192.168.13.3    312         0x80000007 0x0048E3 2
192.168.24.4    192.168.24.4    179         0x80000006 0x0051C6 1

		Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.13.1    192.168.12.1    286         0x80000003 0x00EE6B
192.168.24.2    192.168.12.2    228         0x80000003 0x000D33

		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
192.168.12.0    192.168.12.1    925         0x80000003 0x00F25B
192.168.12.0    192.168.12.2    471         0x80000003 0x00EC60

                Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
4.4.4.4         192.168.24.4    179         0x80000003 0x005EAA 0
```
R4 also installs the appropriate routes in its RIB.
```md
R4#sh ip route | b Gateway
Gateway of last resort is not set

      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/4] via 192.168.24.2, 00:07:38, GigabitEthernet0/0
      4.0.0.0/32 is subnetted, 1 subnets
C        4.4.4.4 is directly connected, Loopback0
O IA  192.168.12.0/24 [110/2] via 192.168.24.2, 01:10:42, GigabitEthernet0/0
O     192.168.13.0/24 [110/3] via 192.168.24.2, 00:07:38, GigabitEthernet0/0
      192.168.24.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.24.0/24 is directly connected, GigabitEthernet0/0
L        192.168.24.4/32 is directly connected, GigabitEthernet0/0
```

This demonstrates that if the backbone area in OSPF is discontiguous, we run into all sorts of routing problems. Routers will not be able to build a proper view of the topology. 

The case we covered in this post only considered discontiguous backbone area. But the problem of incomplete topology views in OSPF is also experienced if non-backbone areas are built in a discontiguous manner. There are duct-tape type fixes to these problems but good design practice is critical to avoid such situations. ABR and ASBR placement considerations play a great deal into optimal OSPF routing implementations.