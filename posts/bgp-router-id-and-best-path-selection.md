---
title: "BGP Router ID & Best Path Selection"
date: "2022-07-10"
categories: 
  - "valarnet"
tags: 
  - "bgp"
  - "cisco"
---
This article explains BGP router ID and path selection behavior in Cisco IOS 15.7.

In BGP, the router ID serves as an identifier and best path selection tie breaker if all other preceding path selection parameters match. BGP prefers the path learned via the lowest router ID.  

If BGP router ID is not explicitly configured, BGP takes the highest IP address from one of its interfaces and uses it as an ID. The BGP router-id doesn't have to be routable. 

The **"bgp bestpath compare-routerid"** command can be used under bgp router configuration mode to enable BGP to compare paths based on router ID. Cisco IOS by default disables this.

![](/static/img/bgp-router-id.png)

At first, only the link between R1 and R2 is setup. Interfaces linking R1 and R3 are not yet configured and are left in administratively down state.
```md
R1#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.1      YES manual up                    up
GigabitEthernet0/1         unassigned      YES unset  administratively down down
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down

R2#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.2      YES manual up                    up
GigabitEthernet0/1         unassigned      YES unset  administratively down down
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down
R2#ping 10.12.12.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.12.12.1, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5), round-trip min/avg/max = 1/1/2 ms
```
R1 and R2 are then configured for BGP peering with all the defaults. R1 is in AS 100 and R2 is in AS 200.
```md
R1#sh run | sec router bgp
router bgp 100
 bgp log-neighbor-changes
 neighbor 10.12.12.2 remote-as 200
 
R2#sh run | sec router bgp
router bgp 200
 bgp log-neighbor-changes
 neighbor 10.12.12.1 remote-as 100
```
R1 takes 10.12.12.1 as its router ID.
```md
R1#sh ip bgp summa
BGP router identifier 10.12.12.1, local AS number 100
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.2      4          200      10      10        1    0    0 00:06:14        0
```
R2 takes 10.12.12.2 as its router ID.
```md
R2#sh ip bgp summa
BGP router identifier 10.12.12.2, local AS number 200
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.1      4          100      10      10        1    0    0 00:06:06        0
```
Now R1's Gi0/1 interface to R3 is configured and brought up.
```md
R1#sh run | sec interface GigabitEthernet0/1
interface GigabitEthernet0/1
 ip address 10.13.13.1 255.255.255.0
 duplex auto
 speed auto
 media-type rj45
 R1#sh ip int br
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         10.12.12.1      YES manual up                    up
GigabitEthernet0/1         10.13.13.1      YES manual up                    up
GigabitEthernet0/2         unassigned      YES unset  administratively down down
GigabitEthernet0/3         unassigned      YES unset  administratively down down
```
Even though 10.13.13.1 IP address is higher than 10.12.12.1, R1's BGP router ID remains unchanged as 10.12.12.1
```md
R1#sh ip bgp summa
BGP router identifier 10.12.12.1, local AS number 100
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.2      4          200      15      15        1    0    0 00:10:19        0
```
When a "clear ip bgp *" is performed to hard reset the BGP connections, R1's BGP router ID changes to 10.13.13.1
```md
R1#sh ip bgp summa
BGP router identifier 10.13.13.1, local AS number 100
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.12.12.2      4          200       4       4        1    0    0 00:00:06        0
```
The "clear ip bgp *" command not only resets the peering but also forces BGP to reinstantiate and pickup a new router ID.  A reboot of the router would also have a similar effect as well.

The entire topology is now configured using basic peerings and with default values. Loopback0 of R4 is created last and advertised into BGP using a network statement. 

Randomness with which interfaces are configured and BGP process instantiated determines what router ID each router takes for BGP.

The output below shows that the highest address on R4 when the BGP process was instantiated is 10.34.34.4. It is selected as R4's BGP router ID.
```md
R4#sh ip bgp summa
BGP router identifier 10.34.34.4, local AS number 400
BGP table version is 1, main routing table version 1

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.23.23.2      4          200       2       4        1    0    0 00:00:11        0
10.34.34.3      4          300       2       2        1    0    0 00:00:07        0
```
R1 now sees Loopback0 address of R4 via two paths: one via R2 and another via R3. R1 selected the path to 192.168.1.1/32 via R3 as the best.
```md
R1#sh ip bgp
BGP table version is 2, local router ID is 10.13.13.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
              t secondary path,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
 *    192.168.1.1/32   10.12.12.2                             0 200 400 i
 *>                    10.13.13.3                             0 300 400 i
```

R2's router ID is 10.12.12.2. R3's router ID is 10.34.34.3.
```md
R1#sh ip bgp 192.168.1.1
BGP routing table entry for 192.168.1.1/32, version 2
Paths: (2 available, best #2, table default)
  Advertised to update-groups:
     1
  Refresh Epoch 1
  200 400
    10.12.12.2 from 10.12.12.2 (10.12.12.2)
      Origin IGP, localpref 100, valid, external
      rx pathid: 0, tx pathid: 0
  Refresh Epoch 1
  300 400
    10.13.13.3 from 10.13.13.3 (10.34.34.3)
      Origin IGP, localpref 100, valid, external, best
      rx pathid: 0, tx pathid: 0x0
```

192.168.1.1/32 is an eBGP learned prefix. Since "bgp bestpath compare-routerid" is disabled by default, R1 selected the path via R3 as it was the oldest received path for 192.168.1.1/32. This is apparent in the sequence the prefixes are listed in the "show ip bgp" output. The "show ip bgp" output displays the newest received prefix for the same path at the top and the older ones lower in the list.

Turning off R3's Gi0/0 link to R1 and allowing BGP sufficient time to converge will withdraw the 192.168.1.1/32 prefix from R1's BGP table. 
```md
R1#sh ip bgp
BGP table version is 4, local router ID is 10.13.13.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
              t secondary path,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
 *>   192.168.1.1/32   10.12.12.2                             0 200 400 i
```
Then re-enabling Gi0/0 on R1 to advertise the prefix again will allow it to propagate. Now the path via R2 is the oldest route and is selected as the best path. In the output, it also shows at the bottom of the list reflecting that it is the oldest.
```md
R1#sh ip bgp
BGP table version is 4, local router ID is 10.13.13.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
              t secondary path,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
 *    192.168.1.1/32   10.13.13.3                             0 300 400 i
 *>                    10.12.12.2                             0 200 400 i
```
Next "bgp bestpath compare-routerid" is enabled on R1.
```md
R1#sh run | sec router bgp
router bgp 100
 bgp log-neighbor-changes
 bgp bestpath compare-routerid
 neighbor 10.12.12.2 remote-as 200
 neighbor 10.13.13.3 remote-as 300
```
To trigger best path selection, a "clear ip bgp *" is performed on R1. The path via R3 is the oldest (by virtue of it showing at the bottom of the list in show ip bgp list). But the path via R2 is installed as the best path since it was learned via R2 (lower router ID 10.23.23.2 compared to R3's 10.34.34.3).

```md
R1#sh ip bgp
BGP table version is 2, local router ID is 10.13.13.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
              t secondary path,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
 *>   192.168.1.1/32   10.12.12.2                             0 200 400 i
 *                     10.13.13.3                             0 300 400 i
```
```md
R1#sh ip bgp 192.168.1.1
BGP routing table entry for 192.168.1.1/32, version 2
BGP Bestpath: compare-routerid
Paths: (2 available, best #1, table default)
  Advertised to update-groups:
     2
  Refresh Epoch 2
  200 400
    10.12.12.2 from 10.12.12.2 (10.23.23.2)
      Origin IGP, localpref 100, valid, external, best
      rx pathid: 0, tx pathid: 0x0
  Refresh Epoch 2
  300 400
    10.13.13.3 from 10.13.13.3 (10.34.34.3)
      Origin IGP, localpref 100, valid, external
      rx pathid: 0, tx pathid: 0
```
Which entry i.e. path via R2 or R3 is oldest can be simulated by turning off interface linking R1 to either R2 or R3 respectively. In the case of the output shown above, it wasn't necessary to do so.