---
title: "Route Distinguishers, Route Targets, and BGP Site of Origin"
date: "2022-07-13"
categories: 
  - "valarnet"
tags: 
  - "bgp"
  - "mpls"
  - "cisco"
---
The implementation of IPv4 BGP (RFC 1771) has been extended  with additional capabilities to support MPLS VPN. This is what is known as multiprotocol BGP (MP-BGP) defined in RFC 4760. 

One use of MP-BGP is to carry MPLS VPN IPv4 network layer reachability information (NLRIs), resulting in Layer 3 VPN technology where a common MPLS core infrastructure is used for isolation between different customers or tenants. 

In the extended BGP capabilities, route targets (RT), route distinguishers (RD), and BGP Site-of-Origin (SOO) are defined. These are typically displayed in similar looking formats. But they perform different functions.

An important first distinction is route targets and Site of Origin are defined in MP-BGP as extended communities; whereas route distinguisher is not a community value.

#### Descriptions, Format, and Functions
##### Route Distinguishers (RD)
Route distinguisher is an 8 byte (64 bit) value that gets appended to an IPv4 prefix to ensure routes are unique in the MPLS backbone. 

A format that is often used to represent an RD is *ASN:LocalAssignedValue* such as 65101:1 where 65101 is the Autonomous System Number and 1 is a locally assigned value. But from a router's perspective, this notation is irrelevant. It compares the whole 8 bytes.

A route distinguisher can be assigned per VPN, per VRF, or per VRF per site. Therefore, an RD should not be expected to necessarily describe a site or a VPN. It may or it may not depending on the RD design used. What is required of an RD is to distinguish and provide uniqueness among routes; not sites or VPNs.

If the same 10.16.1.0/24 IPv4 prefix is advertised into the MPLS backbone from different places, on provider edge (PE) routers different RD values need to be appended so the routes are recognized as distinct in the MPLS core.

![](/static/img/route-distinguisher.png)

The RDs are appended to create two unique entries (**65101**:1:10.16.1.0/24 and **65102**:1:10.16.1.0/24) from the same 10.16.1.0/24 route.

##### Route Targets (RTs)

A BGP community is an attribute that is used to identify a set of prefixes that share similar characteristics or are candidates for similar policy treatment. There are standard communities which are 32 bits long and extended communities which are 64 bits long.

Route targets are **extended community** values. Therefore, 64 bits long.

Route target identifies VPNs or sites. It is commonly formatted in similar way to route distinguishers (*ASN:LocalAssignedValue*) even though it provides different functions.

The **import** and **export** actions are applied on route targets to affect VPN IPv4 route distributions between sites or VPNs. 

![](/static/img/route-targets.png)

The topology above shows Site-1, Site-2, and Site-3. Based on the export settings, prefixes from Site-1 enter the MPLS core carrying 65101:101 extended community. Prefixes from Site-2 enter the MPLS core carrying 65102:102 extended community. Similarly, prefixes from Site-3 enter the MPLS core with 65103:103 extended community.

The import statements control which routes are distributed at the corresponding PE router. Site-3 imports the routes from both Site-1 (import 65101:101) and Site-2 (import 65102:102). Site-1 and Site-2 only take in the routes advertised by Site-3 (import 65103:103).

##### BGP Site of Origin (SOO)

Yet another MP-BGP capability that commonly follows similar formatting with route distinguishers and route targets is the Site of Origin. 

Site of Origin is an extended community value. Therefore, it is 64 bits long. Similar format *ASN:LocalAssignedValue* is often used to represent it.

RFC 4364 describes the Site of Origin as:
>  "The purpose of this attribute is to uniquely identify the set of routes learned from a particular sites. This attribute is needed in some cases to ensure that a route learned from a particular site via a particular PE/CE connection is not distributed back to the site through a different PE/CE connection.  It is particularly useful if BGP is being used as the PE/CE protocol, but different sites have not been assigned distinct ASNs.

![](/static/img/bgp-site-of-origin.png)

In the topology shown above, Site-1 is multihomed to the MPLS backbone. CE1 and CE2 are in the same AS. CE1 injects prefix into BGP via PE1. PE1 tags the prefix with the Site of Origin to mark which site it originated from. PE1 advertises this prefix to PE2 via VPNv4 iBGP peering. The Site of Origin extended community can then be used to stop PE2 from sending the prefix back into Site-1 via CE2. Thus avoiding potentials for a loop.

The particular cases when BGP's AS Path attribute as a loop avoidance mechanism fails and Site of Origin comes in handy is of interest. It will be explained in a separate configuration and outputs post.

In summary: 
- Route distinguishers are not community values and provide uniqueness among specific routes. They are not required to identify sites or VPNs.
- Route targets are extended community values and identify sites or VPNs. Route distribution among VPNs or sites can be controllerd using **import** and **export** actions on route target values. 
- Site of Origin is an extended community value that can be used for loop prevention when a site is MPLS VPN multihomed.