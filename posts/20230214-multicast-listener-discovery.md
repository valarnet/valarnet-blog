---
title: "Multicast Listener Discovery"
date: "2023-02-14"
categories: 
  - "valarnet"
tags: 
  - "multicast"
--- 

Multicast Listener Discovery (MLD) is a component of the IPv6 "suite." MLDv1 is specified in [RFC 2710](https://www.rfc-editor.org/rfc/rfc2710) and MLDv2 is specified in [RFC 3810](https://www.rfc-editor.org/rfc/rfc3810)

The purpose of MLD tracks similarly to the one IGMP accomplishes in IPv4 networks. That is, it is used to manage membership of hosts and routers to multicast groups. 

IGMP has three versions serving in IPv4 networks. 
  - IGMPv1 is the original implementation where basic query and report mechanisms were laid out in. 
  - IGMPv2 improved on IGMPv1 by adding capability for hosts to explictly leave multicast groups rather than continuing to receive multicast traffic they have no need for and letting it expire. IGMPv2 is considered backwards compatible (with caveats) with IGMPv1-only capable hosts and devices.
  - IGMPv3 further enhanced on the capabilities of IGMPv1 and IGMPv2 by allowing hosts to specifically request to include or exclude certain multicast groups that they wish to join. IGMPv3 is a pre-requisite to deploy Source-Specific Multicast (SSM).

In IPv6 networks, MLDv1 is a functional equivalent of IGMPv2. Whereas, MLDv2 is a functional equivalent of IGMPv3. MLDv2 makes deployment of SSM in IPv6 networks possible.

MLD is a sub-protocol of ICMPv6. MLD messages have the following format:

![](/static/img/mld-message-format.png)

There are three types of MLD messages as designated by the "Type" field.

  **MLD Query:**  Type = decimal 130. There are twq subtypes of the MLD query. First one is called "General Query" and is used to learn which multicast addresses have listeners on an attached link. The second sybtype is called Multicast-Address-Specific query and, as the name implies, is used to learn if a particular multicast address has any listeners on an attached link. The MMulticast Address field differentiates between the two subtypes.
> General Queries are sent to the link-scope all-nodes multicast address (FF02::1), with a Multicast Address field of 0, and a Maximum Response Delay of [Query Response Interval].

  **MLD Listener Report:** Type = decimal 131. When any node begins to listen to a multicat address, it sends an unsolicited Report message. In adidition to unsolicited message, the listener may also send this Report to register for a multicast group in response to a query. These messages are sent to a special FF02::16 address. 

  **MLD Listener Done:**  Type = decimal 132. The Multicast Address field in the Done message holds the address of the specific IPv6 multicast address to which the Done message generator is no longer interested to listen to.
> When a node ceases to listen to a multicast address on an interface, it SHOULD send a single Done message to the link-scope all-routers multicast address (FF02::2), carrying in its Multicast Address field the address to which it is ceasing to listen.

##### Further Reading:
  - [Multicast Listener Discovery (MLD) for IPv6 - RFC 2710](https://www.rfc-editor.org/rfc/rfc2710)
  - [Multicast Listener Discovery Version 2 (MLDv2) for IPv6 - RFC 3810](https://www.rfc-editor.org/rfc/rfc3810)
  - [IPv6 Multicast Listener Discovery Protocol](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-multicast/b-ip-multicast/m_ipv6-mcast-mld-xe.pdf)