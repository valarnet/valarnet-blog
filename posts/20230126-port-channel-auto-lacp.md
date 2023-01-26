---
title: "Port-Channel Auto"
date: "2023-01-26"
categories: 
  - "valarnet"
tags: 
  - "switching"
  - "lacp"
---

This post is based on Cisco IOSv2 15.2 firmware running in EVE-NG. The behavior may differ on other firmware versions.

When configuring aggregated links - or bundles - using the Cisco "port-channel auto" option, the most popular etherchannel verification commands may not always tell the whole story. 

Auto LAG can be enabled either globally or directly on member interfaces. It automatically uses LACP to bring up bundles between the devices. In this post, we'll just enable it globallly on all three participating switches in the topology below.

**TL;DR:** Using the command **"show etherchannel auto"** displays the flag **A** indicating the bundles were formed using auto LAG. In contrast, the commonly used etherchannel verification oommands **"show etherchannel summary"** or **"show etherchannel 1 detail"** do not provide indication that auto LAG is in use.

Topology:

![](/static/img/triangle-of-switches.png)

All spanning-tree configuration on the switches is left on default. SW1 is selected as the root for VLAN 1 due to it having the lowest bridge ID. (i.e., 5000.001f.0000 vs the other two switches SW2 and SW3)
```md
SW1#sh spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol rstp
  Root ID    Priority    32769
             Address     5000.001f.0000
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     5000.001f.0000
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/0               Desg FWD 4         128.1    Shr
Gi0/1               Desg FWD 4         128.2    Shr
Gi0/2               Desg FWD 4         128.5    Shr
Gi0/3               Desg FWD 4         128.6    Shr
```

SW2 has selected its Gi0/2 as root port towards the root SW1. SW2 has won the per-segment designated port election versus SW3. Gi0/3 on SW2 is placed in a blocked state.
```md
SW2#sh spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol rstp
  Root ID    Priority    32769
             Address     5000.001f.0000
             Cost        4
             Port        5 (GigabitEthernet0/2)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     5000.0020.0000
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/0               Desg FWD 4         128.1    Shr
Gi0/1               Desg FWD 4         128.2    Shr
Gi0/2               Root FWD 4         128.5    Shr
Gi0/3               Altn BLK 4         128.6    Shr
```

SW3 has selected its Gi0/0 as root port towards the root SW1 and blocked all its other ports.
```md
SW3#sh spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol rstp
  Root ID    Priority    32769
             Address     5000.001f.0000
             Cost        4
             Port        1 (GigabitEthernet0/0)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     5000.0021.0000
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/0               Root FWD 4         128.1    Shr
Gi0/1               Altn BLK 4         128.2    Shr
Gi0/2               Altn BLK 4         128.3    Shr
Gi0/3               Altn BLK 4         128.4    Shr
```

All connected ports between the switches have been configured to trunk with 802.1Q as the encapsulation method.

Now we enable port-channel auto in global mode on all three swiches
```md
SW1, SW2, & SW3
(config)# port-channel auto
```

The switches automatically form bundles with each other.
```md
SW1#show etherch summa
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      N - not in use, no aggregation
        f - failed to allocate aggregator

        M - not in use, minimum links not met
        m - not in use, port not aggregated due to minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

        A - formed by Auto LAG


Number of channel-groups in use: 2
Number of aggregators:           2

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/2(P)    Gi0/3(P)
2      Po2(SU)         LACP      Gi0/0(P)    Gi0/1(P)

```

SW2
```md
SW2#sh etherch summa
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      N - not in use, no aggregation
        f - failed to allocate aggregator

        M - not in use, minimum links not met
        m - not in use, port not aggregated due to minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

        A - formed by Auto LAG


Number of channel-groups in use: 2
Number of aggregators:           2

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/2(P)    Gi0/3(P)
2      Po2(SU)         LACP      Gi0/0(P)    Gi0/1(P)

```

SW3
```md
SW3#sh etherch summa
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      N - not in use, no aggregation
        f - failed to allocate aggregator

        M - not in use, minimum links not met
        m - not in use, port not aggregated due to minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

        A - formed by Auto LAG


Number of channel-groups in use: 2
Number of aggregators:           2

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/0(P)    Gi0/1(P)
2      Po2(SU)         LACP      Gi0/2(P)    Gi0/3(P)
```

Checking under the port-channels shows no configuration at all. On SW1:
```md
SW1#sh run int po1
Building configuration...

Current configuration : 5 bytes
end

SW1#sh run int po2
Building configuration...

Current configuration : 5 bytes
end

SW1#
```

The individual interfaces of Po1 on SW1 show the configuration below. But this still doesn't tell us that these interfaces are bundled; let alone using Auto LAG.

```md
SW1#show run int gi0/2
Building configuration...

Current configuration : 132 bytes
!
interface GigabitEthernet0/2
 switchport trunk encapsulation dot1q
 switchport mode trunk
 media-type rj45
 negotiation auto
end

SW1#show run int gi0/3
Building configuration...

Current configuration : 132 bytes
!
interface GigabitEthernet0/3
 switchport trunk encapsulation dot1q
 switchport mode trunk
 media-type rj45
 negotiation auto
end

SW1#
```

There's still no indication in the outputs that these bundles were formed using port-channel auto. The "show etherch summa" flags show that **A** stands for ***formed by Auto LAG.*** But we're not seeing that flag in the outputs either.

Let's give that output a try and see if there's any indicator

```md
SW1#show etherch 1 detail
Group state = L2
Ports: 2   Maxports = 4
Port-channels: 1 Max Port-channels = 4
Protocol:   LACP
Minimum Links: 0


		Ports in the group:
		-------------------
Port: Gi0/2
------------

Port state    = Up Mstr Assoc In-Bndl
Channel group = 1           Mode = Active          Gcchange = -
Port-channel  = Po1         GC   =   -             Pseudo port-channel = Po1
Port index    = 0           Load = 0x00            Protocol =   LACP

Flags:  S - Device is sending Slow LACPDUs   F - Device is sending fast LACPDUs.
        A - Device is in active mode.        P - Device is in passive mode.

Local information:
                            LACP port     Admin     Oper    Port        Port
Port      Flags   State     Priority      Key       Key     Number      State
Gi0/2     SA      bndl      32768         0x1       0x1     0x101       0x3D

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
Gi0/2     SA      32768     5000.0020.0000  15s    0x0    0x1    0x101   0x3D

Age of the port in the current state: 0d:00h:10m:14s

Port: Gi0/3
------------

Port state    = Up Mstr Assoc In-Bndl
Channel group = 1           Mode = Active          Gcchange = -
Port-channel  = Po1         GC   =   -             Pseudo port-channel = Po1
Port index    = 0           Load = 0x00            Protocol =   LACP

Flags:  S - Device is sending Slow LACPDUs   F - Device is sending fast LACPDUs.
        A - Device is in active mode.        P - Device is in passive mode.

Local information:
                            LACP port     Admin     Oper    Port        Port
Port      Flags   State     Priority      Key       Key     Number      State
Gi0/3     SA      bndl      32768         0x1       0x1     0x102       0x3D

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
Gi0/3     SA      32768     5000.0020.0000  13s    0x0    0x1    0x102   0x3D

Age of the port in the current state: 0d:00h:10m:14s

		Port-channels in the group:
		---------------------------

Port-channel: Po1    (Primary Aggregator)

------------

Age of the Port-channel   = 0d:00h:10m:16s
Logical slot/port   = 16/0          Number of ports = 2
HotStandBy port = null
Port state          = Port-channel Ag-Inuse
Protocol            =   LACP
Port security       = Disabled

Ports in the Port-channel:

Index   Load   Port     EC state        No of bits
------+------+------+------------------+-----------
  0     00     Gi0/2    Active             0
  0     00     Gi0/3    Active             0

Time since last port bundled:    0d:00h:10m:14s    Gi0/3
```

Still no luck with an output indicator telling us that this port channel was formed using auto method.

But the command **show etherchannel auto** on SW1 displays what we're expecting to see.
```md
SW1#show etherch auto
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      N - not in use, no aggregation
        f - failed to allocate aggregator

        M - not in use, minimum links not met
        m - not in use, port not aggregated due to minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

        A - formed by Auto LAG


Number of channel-groups in use: 2
Number of aggregators:           2

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SUA)        LACP      Gi0/2(P)    Gi0/3(P)
2      Po2(SUA)        LACP      Gi0/0(P)    Gi0/1(P)
```

This time the flag A is visible in the output telling us that the two port channels were formed using auto LAG.

This is one of those cosmetic output issues that makes it appear one thing is happening when in fact another is the real operational state. 