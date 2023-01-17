---
title: "Default Route Origination - BGP, OSPF, and EIGRP"
date: "2023-01-16"
categories: 
  - "valarnet"
tags: 
  - "bgp"
  - "ospf"
  - "eigrp"
---
### BGP Default Origination
1. Using *"network 0.0.0.0"* statement. A default route must be present in the routing table. BGP injects default route into the BGP RIB and advertises it.
2. Using *redistribution.* A default route learned via an IGP or static must be present in the routing table. BGP injects default route into the BGP RIB and advertises it.
3. Using *"default-information-originate."* BGP artificially generates a default route and injects it into the local BGP RIB and advertises it to all peers.
4. Using *"neighbor x.x.x.x default-originiate."* BGP artificially generates a default route and advertises it ONLY to the specified neighbor. The default route will not be installed in the BGP RIB. Therefore, it will not be advertised to other peers.
5. **Can aggregation be used on its own as a default route advertisement mechanism?** If attempting to advertise a default route with an *aggregate-address 0.0.0.0 0.0.0.0 summary-only* command, you'll be met with a notification message with an attitude. **% Aggregating to create default makes no sense, use a network statement instead.**

### OSPF Default Origination
**Fun fact:** A default route cannot be redistributed into OSPF. But it can be "mimicked."
1. Using *"default-information originate"* if the advertising router has a non-OSPF default route in its routing table.
2. Using *"default-information originate always"* if the advertising router does NOT have a non-OSPF default route in its routing table. This is a functional equivalent of the **"Fun fact"** above.
3. The *default-information originate* can be used with route-map to check for conditions of links or other routes presence before advertising default. For example, if the link to ISP1 is still in my routing table, advertise default to downstream neighbors. If the link is down, stop advertising the default route.
4. By default, ABRs generate a default into stub areas. Default route appears as O IA.
5. Cisco routes don't advertise external default routes into an NSSA area even when using the *default-information originate always*. Therefore:
>  5.1 Advertise type-7 NSSA default route into the NSSA area. Use *area nssa default-information originate* on the ABR.
  
>  5.2 Make the area **totally NSSA**. Use *area X nssa no-summary* on the ABR. This command denies type-3 or type-4 LSAs from entering area X. It injects a default route into the area as a type-3 summary LSA.

6. **Can summarization be used on its own as a default route advertisement mechanism?** Baseline fact to know: OSPF supports twp types of summarization: inter-area summarization and external route summarization. OSPF can summarize internal routes only at ABRs and external routes only at ASBRs. (Important: this behavior contrasts with how EIGRP performs summarization.) Therefore:

> 6.1 On ASBRs, if attempting to summarize external routes (i.e. type-5 or type-7) using just *"summary-address 0.0.0.0 0.0.0.0"* IOS will take the command, by default add the *not-advertise* option to it, and filters out external LSAs from being advertised to the nieghbor. However, it does not advertise a default route. It is required to use the *default-information originate*, if a non-OSPF default is already present in the routing table, or the *default-information originate always* variant without regard to a non-OSPF default route's presence. In contrast, if *ip summary-address* command is used on an EIGRP interface, a default route is propagated to the neighbor via that interface.

> 6.2 On ABRs, if attempting to summarize between areas using just *"area X range 0.0.0.0 0.0.0.0"*, IOS will complain *"% OSPF: Cannot add this range as 0.0.0.0/0 represents default"* Therefore, this does not allow for default route advertisement.

### EIGRP Default Origination
1. Using *redistribution.* A statically created or a default route learned via another routing protocol must be present in the routing table. The default route advertised using this method will be an external i.e. D EX route.
2. Using *ip summary-address* command.  A default route can be advertised to a neighbor via the interface command *ip summary-address eigrp [AS_NUMBER] 0.0.0.0 0.0.0.0* If using named-mode EIGRP, this can be configured by using *summary-address* under the *af-interface Gi0/0* stanza within the EIGRP process. The default route generated with this method will be an internal i.e. D route.  
4. Using the *"network 0.0.0.0"* command. As a condition for advertisement, a non-EIGRP default route must be present in the routing table. The advertised default route will be an internal i.e D* route. An odd behavior is observed when utilizing this command on a router that runs multiple autonmous systems i.e., the router advertises subnets assigned in one EIGRP AS to a separate EIGRP AS altogether.
5. **MOST LIKELY DEPRECATED** Using the global *ip default-network* command with EIGRP. This is an old method and behaves differently in newer IOS code. It used to be the case that EIGRP would pick up a classful network (A, B, or C) configured with the global *ip default-network* command and insert it into its topology table.  Theoretically, this would then be progagated to neighbors as a candidate default route. I haven't been able to recreate this behavior in newer IOS code (15.7) even in combination with a *network* statement.