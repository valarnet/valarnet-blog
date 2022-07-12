---
title: "BGP Router ID & Loopback Interfaces"
date: "2022-07-12"
categories: 
  - "valarnet"
tags: 
  - "bgp"
  - "cisco"
---
This article shows BGP implementation on Cisco IOS prefers to use address from a loopback interface as its router ID even if there is another higher IP address on a physical interface.

A simple two router topolgy is utilized.

![](/static/img/bgp-router-id-loopback.png)

The IP addresses on the physcial and loopback interfaces of both routers are configured.
To test if the router considers an IP address on a disabled interface for use as a router ID, the loopback interfaces on R1 and R2 are adminsitratively shutdown.
```
R1#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.1      YES manual up                    up
GigabitEthernet0/1         unassigned      YES unset  administratively down down
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down
Loopback0                  1.1.1.1         YES manual administratively down down
```
```
R2#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.2      YES manual up                    up
GigabitEthernet0/1         unassigned      YES unset  administratively down down
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down
Loopback0                  2.2.2.2         YES manual administratively down down
```

Then BGP peering is configured on R1 and R2 with basic default settings.
```
R1#sh run | sec router bgp
router bgp 100
 bgp log-neighbor-changes
 neighbor 10.12.12.2 remote-as 200
```
```
R2#sh run | sec router bgp
router bgp 200
 bgp log-neighbor-changes
 neighbor 10.12.12.1 remote-as 100
```
R1 takes **10.12.12.1** as its router ID.
```
R1#sh ip bgp summa
BGP router identifier 10.12.12.1, local AS number 100
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.2      4          200       5       5        1    0    0 00:01:42        0
```
R2 takes **10.12.12.2** as its router ID.
```
R2#sh ip bgp summa
BGP router identifier 10.12.12.2, local AS number 200
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.1      4          100       6       6        1    0    0 00:02:22        0
```
Next, the loopback interfaces on R1 and R2 are brought up.
```
R1#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.1      YES manual up                    up
GigabitEthernet0/1         unassigned      YES unset  administratively down down
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down
Loopback0                  1.1.1.1         YES manual up                    up
```
```
R2#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.2      YES manual up                    up
GigabitEthernet0/1         unassigned      YES unset  administratively down down
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down
Loopback0                  2.2.2.2         YES manual up                    up
```
Finally "clear ip bgp *" is performed on both R1 and R2 to trigger the BGP process.

R1 now takes **1.1.1.1** as its BGP router ID.
```
R1#sh ip bgp summa
BGP router identifier 1.1.1.1, local AS number 100
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.2      4          200       2       2        1    0    0 00:00:12        0
```
R2 takes **2.2.2.2** as its BGP router ID.
```
R2#sh ip bgp summa
BGP router identifier 2.2.2.2, local AS number 200
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.1      4          100       4       4        1    0    0 00:01:34        0
```
This demonstrates that the BGP router ID assignment process on Cisco IOS scans **(at the time of BGP instantiation)** if there are any active loopback interfaces. The highest among the addresses on active loopback interfaces is preferred as router ID before considering any addresses on physical interfaces.

1.1.1.1 is lower than 10.12.12.1. But since 1.1.1.1 is an address on an active loopback interface, it is preferred for use as the BGP router ID for R1.




