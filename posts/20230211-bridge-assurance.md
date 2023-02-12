---
title: "Bridge Assurance"
date: "2023-02-11"
categories: 
  - "valarnet"
tags: 
  - "switching"
---

A major difference between traditional STP (802.1d) versus RSTP (802.1w) - or MST (802.1s) which utilizes RSTP's mechanisms - is how BPDUs are sent. In traditional STP (802.1d), BPDUs received from the root bridge are relayed via downstream connected ports. However, in RSTP (802.1w) based systems, BPDUs are sent instead of just being relayed. This means a bridge sends BPDUs every hello interval (2 seconds, by default) regardless of it receiving BPDUs from the root bridge or not. The BPDUs in RSTP are used as keepalives. By default, if three consecutive BPDUs are missed, it is used as an indication of connectivity issues to a bridge's direct neighbor.

Bridge Assurance works with RSTP and MST since it relies on the ability to send BPDUs which the traditional STP doesn't have capability for. It is a feature that monitors the receipt of BPDUs on point-to-point links on all network ports. Bridge Assurance helps prevent loops caused by unidirectional links or a malfunction in a neighboring switch. 

When Bridge Assuarnce is enabled, BPDUs are sent on all operational ports that have STP port type "network", **including alternate and backup ports.** (*Note:* Sending BPDUs on alternate and backup ports is not a regular operation of spanning tree. Bridge Assurance alters this behavior.) If BPDUs are not received on a port within the hello time period, the port is moved into a blocked state (port inconsistent state.) The port stops the forwarding of frames and prevents loops. 

```md
%SPANTREE-2-BRIDGE_ASSURANCE_BLOCK: 
Bridge Assurance blocking port GigabitEthernet0/1 on VLAN0100.
```

If a blocked port starts receiving BPDUs again, the port is removed from bridge assurance blocking state, and goes through normal RSTP transition process.

On vPC peer-links, Bridge Assurance is enabled automatically. Bridge Assurance is not supported on vPC member ports since these ports are always in forwarding state.

##### Further Reading
[Understanding Rapid Spanning Tree Protocol (802.1w)](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24062-146.html#anc6)

[Configuring Optional Spanning Tree Features](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9500/software/release/16-12/configuration_guide/lyr2/b_1612_lyr2_9500_cg/configuring_optional_spanning_tree_features.html#Cisco_Concept.dita_cfe5e337-9809-43c3-901e-32b7226805f4)

[Design and Configuration Guide: Best Practices for vPC on Cisco Nexus 7000 Switches](https://www.cisco.com/c/dam/en/us/td/docs/switches/datacenter/sw/design/vpc_design/vpc_best_practices_design_guide.pdf)