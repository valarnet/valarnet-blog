---
title: "BGP EVPN Filtering"
date: "2023-01-25"
categories: 
  - "valarnet"
tags: 
  - "bgp"
  - "evpn"
---

A recent BGP EVPN Multi-Site troubleshooting effort had me thinking about what the optimal approach to EVPN troubleshooting would be. 

BGP EVPN Multi-Site is built out of lots of components and anything can fail anywhere - bugs, misconfigurations, undocumented quirks, you name it... Once it's figured out, it's often painfully obvious but not so much when smack in the middle of the troubleshooting.

This will evolve over time and perhaps I may end up writing an extended troubleshooting guide to supplement what is already out there. 

There's a lot more to consider and deep dive into in this space. What the correct baseline behavior is will also be highly dependent on the specific design scenario implemented - Anycast BGWs, vPC BGWs, underlay routing protocols, overlay routing protocols, etc. It is an undertaking that is going to need its own focused multi-part series or the production of one organized guide to structure it the way I'm imagining it now.

It doesn't make sense to troubleshoot the data plane before making sure the control planes (both in the underlay and the overlay) are working appropriately.

Here is a very high-level outline of a logical structure that I found useful to follow:

### Control Plane Troubleshooting
> - Verify underlay routing in site-1, site-2, and between the Border Gateways (BGWs) and that all the required loopbacks are learned properly. Verify if there are any route policy filters that interfere with control plane learning.
> - Verify overlay peering between the BGWs, Spines, and Leafs.
> - Verify multicast routing if used for site-internal purposes. 
> - Verify ingress-replication NVE learning occurs properly between the BGWs.
> - Track the hosts and prefixes for proper control plane learning by starting from local leaf, local spine,  local BGW, then across to remote BGWs, remote spines, and remote leafs. Repeat this process in the other direction.

### Data Plane Troubleshooting
> - Verify MTU is set properly across the board.
> - Determine if L2VNI or L3VNI focus matches the symptom.
> - Determine if known unicast, BUM (Broadcast, Unknown Unicast, Multicast) traffic, or both is the failing condition. Track the VTEP to VTEP tunnel formations and verify if traffic path is fully built.
> - Determine if vPCs are configured between switches and if there is a possibility of orphan ports in a misconfigured EVPN setup.

### Route-filtering options in EVPN

This section below is a direct summary of EVPN filtering options on [Cisco](https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/102x/configuration/vxlan/cisco-nexus-9000-series-nx-os-vxlan-configuration-guide-release-102x/m_configuring_bgp_evpn_filtering.html).

##### Matching based on the EVPN route type.
	
```md
conf t
route-map ABC
  match evpn route-type {1|2|2-mac-ip|2-mac-only|3|4|5|6}
end
```

##### Matching based on the MAC address in the NLRI.

```md
conf t
mac-list MY-MACs seq 5 {deny|permit} 0123.4567.89ab
route-map ABC
  match mac-list MY-MACs
end
```

##### Matching based on the RMAC (Router MAC) extended community.

```md
conf t
ip extcommunity-list standard MY-COMMUNITY seq 5 {deny|permit} rmac 0123.4567.89ab
route-map ABC
  match extcommunity MY-COMMUNITY
end
```

##### Setting the RMAC extended community.

```md
conf t
route-map ABC
  set extcommunity evpn rmac 0123.4567.89ab
end
```

##### Setting the EVPN next-hop IP address.

```md
conf t
route-map ABC
  set ip next-hop 10.1.1.1
  set ipv6 next-hop 2001::1
end
```

##### Setting the gateway IP address for route type-5.

```md
conf t
route-map ABC
  set evpn gateway-ip 10.1.1.1
end
```

##### Applying the route-map

```md
conf t
router bgp 65001
  neighbor 10.10.2.1
    address-family l2vpn evpn
      route-map ABC {in|out}
    exit
  exit
exit
```

##### Using table maps to filter MAC routes downloaded to the L2 RIB.

If the filter option is specified, any route that gets denied by the route-map validation isn't downloaded into the L2RIB.
```md
conf t
mac-list MY-MACs seq 5 {deny|permit} 0123.4567.89ab
route-map ABC
  match mac-list MY-MACs
end

conf t
evpn
  vni 10001 l2
    table-map ABC [filter]
end
```

##### Verification

```md
show bgp l2vpn evpn
show bgp l2vpn evpn 0123.4567.89ab
show bgp l2 evpn 10.24.24.21
show ip route 10.24.24.21
show l2route evpn mac all
show l2route evpn mac 0123.4567.89ab
show mac-list
show run rpm
show run bgp
```
