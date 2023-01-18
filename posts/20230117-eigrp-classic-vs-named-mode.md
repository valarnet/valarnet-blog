---
title: "Classic vs Named-Mode EIGRP"
date: "2023-01-17"
categories: 
  - "valarnet"
tags: 
  - "eigrp"
---

In classic EIGRP mode, to configure IPv4 and IPv6, it is required to configure separate EIGRP instances. VRFs are not supported in a classic IPv6 EIGRP implementation.

In EIGRP Named-Mode, multiple address families and VRFs are supported under the same EIGRP instance for both IPv4 and IPv6.

```md
router eigrp ABC-COMPANY
  address-family ipv4 unicast autonomous-system 100
    af-interface Gi0/0
      <interface-level-configs>
    exit-af-interface
  exit-address-family
  address-family ipv6 unicast autonomous-system 200
    af-interface Gi0/0
      <if-level-configs-such-as-auth-bandwidth%-hello-hold-time-nexthop-passive-etc.>
    exit-af-interface
    topology base
      <topology-level-configs-such-as-redistribution-distance-offset-list-timers-etc.>
    exit-af-topology
  exit-address-family
```

EIGRP Named-Mode has three main configuration modes where the majority of configs are made:
>	- Address family config mode (*config-router-af#*)
>	- Address family interface config mode (*config-router-af-interface#*)
>	- Address family topology config mode (*config-router-af-topology#*)

EIGRP Named-Mode uses wide metrics which allows it to support up to 4.2Tbps speed interfaces and utlizes a different formula for the EIGRP metric computation. These are 64-bit metric calculations. 

In contrast, EIGRP classic mode supports only 32-bit cost metric calculations which makes it limited to account for speeds of up to 10Gbps interfaces.

The traditional EIGRP cost composite cost metric uses the formula:

**Metric = 256 * ((K1 * Scaled Bw) + (K2 * Scaled Bw)/(256 – Load) + (K3 * Scaled Delay) * (K5/(Reliability + K4)))**

Where the EIGRP vector metrics bandwidth, delay, load, MTU, and reliability are tuned with the appropriate K-values. By default, only bandwidth and delay are used in the calculation.

The Scaled Bw = 10^7/minimum BW in Kbps. Whereas, the Scaled Delay is sum of delays on a path counted in tens of microseconds.

EIGRP Named-Mode changes up the metric calculation as:

**Metric = [(K1 * Minimum Throughput + {K2 * Minimum Throughput} / 256-Load) + (K3 * Total Latency) + (K6 * Extended Attributes)] * [K5/(K4 + Reliability)]**

Notice the K-values go as high as K6 in EIGRP Named-Mode. K6 is an added K-value for future use. By default only K1 and K3 are set to 1. The rest are set to 0. 

Therefore, the default metric calculation can be reduced to:
**Metric = (K1 * Minimum Throughput) + (K3 * Total Latency)**

Minimum throughput is derived from the minimum bandwidth on a path whereas the total latency is derived from sum of delay values on a path (counted in pico seconds).

The Minimum throughput = (10^7 * 65,536)/ Bw in Kbps 

**Classic to Named-Mode Conversion**

Conversion from classic to named-mode can be performed without causing network flaps or without restarting the EIGRP process. Conversion process is supported for both IPv4 and IPv6 and is not auto-reversible. That is, converting from named-mode back to the classic mode is not supported.

The eigrp upgrade-cli command is available only under EIGRP classic configuration mode. 
```md
router eigrp 100
  eigrp upgrade-cli
```

If you have multiple EIGRP ASes, the process needs to be repeated for every AS you want to convert.

The conversion places the new commands only in the running configuration. After the conversion completes, you must use the "copy run start" or "write mem" commands to save the changes to NVRAM. 

**Further Reading**:

- [Configure EIGRP Named-Mode](https://www.cisco.com/c/en/us/support/docs/ip/enhanced-interior-gateway-routing-protocol-eigrp/200156-Configure-EIGRP-Named-Mode.html)
- [EIGRP Wide Metrics](https://content.cisco.com/chapter.sjs?uri=/searchable/chapter/content/en/us/td/docs/ios-xml/ios/iproute_eigrp/configuration/15-mt/ire-15-mt-book/ire-wid-met.html.xml)
- [Understanding the EIGRP command, "metric rib-scale"](https://ine.com/blog/2018-07-31-understanding-the-eigrp-command-metric-rib-scale)

