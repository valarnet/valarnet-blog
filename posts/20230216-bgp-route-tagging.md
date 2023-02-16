---
title: "BGP Route Tagging"
date: "2023-02-16"
categories: 
  - "valarnet"
tags: 
  - "bgp"
--- 

**TL;DR:** BGP in Cisco IOS (15.7 in this test) automatically tags routes with the most recent AS the prefix passed through.

While experimenting to apply route tags on BGP peering using inbound and outbound route-map methods, I picked up on an interesting tagging behavior in BGP.

A simple topology of R1 in AS100 and R2 in AS200 is used.

```md
R2
route-map SET-TAG-100 permit 10
 set tag 100
!
router bgp 200
 nei 192.168.12.1 route-map SET-TAG-100 out
% "SET-TAG-100" used as BGP outbound route-map, set tag not supported
```

A similar notification message is presented when trying to implement route-map based BGP tagging in the inbound direction.
```md
R1
route-map SET-TAG-100 permit 10
 set tag 100
!
router bgp 100
 nei 192.168.12.2 route-map SET-TAG-100 in
% "SET-TAG-100" used as BGP inbound route-map, set tag not supported
```
However, even though the router throws the notification messages telling us inbound and outbound route-map taggings are not supported, Cisco IOS takes these commands and puts them in the running config.

*Remove the previous route-map based configurations entirely at this point.*

Take a look at a default route received from a peer in AS200. It was configured with a simple per-peer default-information originate command on R2. AS path entry 200 shows it originated there.
```md
R1#sh ip bgp 0.0.0.0
BGP routing table entry for 0.0.0.0/0, version 2
Paths: (1 available, best #1, table default)
  Not advertised to any peer
  Refresh Epoch 4
  200
    192.168.12.2 from 192.168.12.2 (192.168.12.2)
      Origin IGP, localpref 100, valid, external, best
      rx pathid: 0, tx pathid: 0x0
```

Without any  manual tagging configurations in BGP, IOS automatically has tagged the prefix with the most recent AS it came through i.e. 200. 
The "Known via" field is where our router R1 is in.
The "Tag" and "Route tag" fields show that the prefix just passed via AS 200.
```md
R1#sh ip route 0.0.0.0
Routing entry for 0.0.0.0/0, supernet
  Known via "bgp 100", distance 20, metric 0, candidate default path
  Tag 200, type external
  Last update from 192.168.12.2 00:20:24 ago
  Routing Descriptor Blocks:
  * 192.168.12.2, from 192.168.12.2, 00:20:24 ago
      Route metric is 0, traffic share count is 1
      AS Hops 1
      Route tag 200
      MPLS label: none
```

If the route advertisement had traversed another AS 300, this field would change to 300 when it makes it downstream. Unlike AS paths, tags are not prepended. They're replaced entirely by the BGP process to the most recent AS advertising the prefix. 