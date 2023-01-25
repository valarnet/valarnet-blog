---
title: "Advertising IPv6 NLRIs over IPv4 BGP Session"
date: "2023-01-25"
categories: 
  - "valarnet"
tags: 
  - "bgp"
---

This is a simple post that describes a topology of two directly connected routers R1 and R2. R1 runs in BGP ASN 100. R2 runs in BGP ASN 200. R1 and R2 are operating with IOS 15.7 firmware.

![](/static/img/ipv6-nlri-over-ipv4-bgp.png)

The objective is to advertise the IPv6 address on Loopback0 interface of R1 (2001:1::1/128) across an IPv4 BGP session to R2. Similarly, the IPv6 address of Loopback0 on R2 (2001:2::2/128) needs to be advertised to R1. As a verification step, IPv6 pings sourced between the loopbacks should succeed.

First, configure the interface settings on both routers. The cross-link between R1 and R2 requires both IPv4 and IPv6 addresses even though we will form BGP neighborship only over the IPv4 address family. Since we're not using any form of tunneling in this scenario,  IPv6 addresses are needed on the cross-link so we can use them as next-hops to send IPv6 traffic across. The IPv4 addresses on the loopbacks are only for use as BGP router IDs.
```md
R1
interface GigabitEthernet0/0
 ip address 10.3.100.1 255.255.255.0
 ipv6 address 2001:100::1/64
!
interface Loopback0
 ip address 1.1.1.1 255.255.255.255
 ipv6 address 2001:1::1/128
```
```md
R2
interface GigabitEthernet0/0
 ip address 10.3.100.2 255.255.255.0
 ipv6 address 2001:100::2/64
!
interface Loopback0
 ip address 2.2.2.2 255.255.255.255
 ipv6 address 2001:2::2/128
```

Next, configure the BGP peering between the two routers for the IPv4 address family.
```md
R1
router bgp 100
 bgp router-id interface Loopback0
 bgp log-neighbor-changes
 neighbor 10.3.100.2 remote-as 200
 !
 address-family ipv4
  neighbor 10.3.100.2 activate
 exit-address-family
```
```md
R2
router bgp 200
 bgp router-id interface Loopback0
 bgp log-neighbor-changes
 neighbor 10.3.100.1 remote-as 100
 !
 address-family ipv4
  neighbor 10.3.100.1 activate
 exit-address-family
```

At this point, the IPv4 AF BGP peering should form. Verifying from R2.
```md
R2#sh ip bgp summa
BGP router identifier 2.2.2.2, local AS number 200
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.3.100.1      4          100      19      20        1    0    0 00:13:11        0
```

Verifying the capabilities exchanged on R2 shows IPv4 Unicast is the only address family enabled to be advertised and received.
```md
R2#show ip bgp nei 10.3.100.1
BGP neighbor is 10.3.100.1,  remote AS 100, external link
  BGP version 4, remote router ID 1.1.1.1
  BGP state = Established, up for 00:00:17
  Last read 00:00:17, last write 00:00:17, hold time is 180, keepalive interval is 60 seconds
  Neighbor sessions:
    1 active, is not multisession capable (disabled)
  Neighbor capabilities:
    Route refresh: advertised and received(new)
    Four-octets ASN Capability: advertised and received
    Address family IPv4 Unicast: advertised and received
    Enhanced Refresh Capability: advertised and received
    Multisession Capability:
    Stateful switchover support enabled: NO for session 1
~output omitted
```
We will not configure any direct IPv6-based peering. But to advertise IPv6 NLRIs over the IPv4 BGP session, we need to activate the IPv6 address family. This configuration will tear down the BGP session to exchange the new capabilities. We also redistribute connected interfaces into BGP to enable the advertisement of Loopback0 IPv6 addresses.
```md
R1
router bgp 100
 address-family ipv6
  redistribute connected
  neighbor 10.3.100.2 activate
 exit-address-family
```
```md
R2
router bgp 200
 address-family ipv6
  redistribute connected
  neighbor 10.3.100.1 activate
 exit-address-family
```

Verifying from R2 again shows that now, in addition to IPv4 Unicast, IPv6 Unicast is also listed as capable of being advertised and received.
```md
R2#show ip bgp nei 10.3.100.1
BGP neighbor is 10.3.100.1,  remote AS 100, external link
  BGP version 4, remote router ID 1.1.1.1
  BGP state = Established, up for 00:00:07
  Last read 00:00:07, last write 00:00:07, hold time is 180, keepalive interval is 60 seconds
  Neighbor sessions:
    1 active, is not multisession capable (disabled)
  Neighbor capabilities:
    Route refresh: advertised and received(new)
    Four-octets ASN Capability: advertised and received
    Address family IPv4 Unicast: advertised and received
    Address family IPv6 Unicast: advertised and received
    Enhanced Refresh Capability: advertised and received
    Multisession Capability:
    Stateful switchover support enabled: NO for session 1
~output omitted~
```
Let's verify the IPv6 routing table on R2.
```md
R2#show ipv6 route
IPv6 Routing Table - default - 4 entries
~output omitted~
LC  2001:2::2/128 [0/0]
     via Loopback0, receive
C   2001:100::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:100::2/128 [0/0]
     via GigabitEthernet0/0, receive
L   FF00::/8 [0/0]
     via Null0, receive
```
The loopback of R1 is still not installed in the IPv6 route table of R2. Let's verify if it is being learned via BGP.
```md
R2#sh ip bgp ipv6 uni
~output omitted~

     Network          Next Hop            Metric LocPrf Weight Path
 *    2001:1::1/128    ::FFFF:10.3.100.1
                                                0             0 100 ?
 *>   2001:2::2/128    ::                       0         32768 ?
 *    2001:100::/64    ::FFFF:10.3.100.1
                                                0             0 100 ?
 *>                    ::                       0         32768 ?
```
We see 2001:1::1/128 in the BGP IPv6 address family RIB but it is not selected as best route (i.e., no > symbol to the left of it). The next hop shows some 0 & Fs padded on top of the IPv4 next hop address (::FFFF:10.3.100.1).

The next hop ::FFFF:10.3.100.1 is inaccessible. Therefore, BGP can't make use of this route.

```md
R2#show ip bgp ipv6 uni 2001:1::1/128
BGP routing table entry for 2001:1::1/128, version 0
Paths: (1 available, no best path)
  Not advertised to any peer
  Refresh Epoch 1
  100
    ::FFFF:10.3.100.1 (inaccessible) from 10.3.100.1 (1.1.1.1)
      Origin incomplete, metric 0, localpref 100, valid, external
      rx pathid: 0, tx pathid: 0
```

To resolve this issue we will need to setup a route map that sets the IPv6 next hop to the ones we expect on the cross-link (either 2001:100::1 or 2001:100::2). The route maps can be applied to the peers either in the outbound or inbound direction. That would purely be a matter of choice. 

If the IPv6 next hop modifying route map is applied outbound on the BGP neighborship, the advertising router would tell the receiving router to use the IPv6 address on Gi0/0 of the advertising router. Simply put, R1 would use 2001:100::1 to set the next hop. R2 would use 2001:100::2 to set the next hop.

Conversely, if the route map is applied inbound, R1 will set the next hop to be R2's address 2001:100::2. R2 will set the next hop to be R1's address 2001:100::1.

For this particular post, we'll just use the inbound option. We now create the route maps and apply the BGP policy on both routers.

```md
R1
route-map IPv6-SET-NH permit 10
 set ipv6 next-hop 2001:100::2
router bgp 100
 address-family ipv6
  neighbor 10.3.100.2 route-map IPv6-SET-NH in
 exit-address-family
```

```md
R2
route-map IPv6-SET-NH permit 10
 set ipv6 next-hop 2001:100::1
router bgp 200
 address-family ipv6
  neighbor 10.3.100.1 route-map IPv6-SET-NH in
 exit-address-family
```

Let's verify once again in R2's BGP RIB for the IPv6 address family.
```md
R2#sh ip bgp ipv6 uni
~output omitted~

     Network          Next Hop            Metric LocPrf Weight Path
 *>   2001:1::1/128    2001:100::1              0             0 100 ?
 *>   2001:2::2/128    ::                       0         32768 ?
 *    2001:100::/64    2001:100::1              0             0 100 ?
 *>                    ::                       0         32768 ?
```
The Loopback0 of R1 2001:1::1/128 shows the correct next hop 2001:100::1 and is selected as best (>).

The IPv6 route table on R2 shows it installed as a BGP learned route.
```md
R2#show ipv6 route
~output omitted~
B   2001:1::1/128 [20/0]
     via 2001:100::1
LC  2001:2::2/128 [0/0]
     via Loopback0, receive
C   2001:100::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:100::2/128 [0/0]
     via GigabitEthernet0/0, receive
L   FF00::/8 [0/0]
     via Null0, receive
```
Ping test initiated from R2's loopback0 to R1's loopback0 succeeds.
```md
R2#ping 2001:1::1 so lo0
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:1::1, timeout is 2 seconds:
Packet sent with a source address of 2001:2::2
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/1 ms
```

We have been able to advertise IPv6 NLRIs over an IPv4 BGP session by using address families. Advertisement of IPv4 NLRIs over an IPv6 BGP peering can also be achieved by simply reversing the address family logic we used in this post. 

From a capabilities point of view, this works out. If implementing this in the wild is a good idea or not is something that needs to be thought of as a design question and per-case basis.

This post is based on [Cisco](https://community.cisco.com/t5/networking-knowledge-base/advertising-ipv6-prefixes-routes-over-ipv4-ebgp-peers/ta-p/3130696).