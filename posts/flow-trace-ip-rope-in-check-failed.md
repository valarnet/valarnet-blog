---
title: "Flow Trace iprope_in_check() check failed on policy message"
date: "2022-07-14"
categories: 
  - "valarnet"
tags: 
  - "fortinet"
  - "FortiOS"
---
When performing flow traces on a FortiGate firewall, one of the messages that may get thrown is the "iprope_in_check() check failed, drop"

Flow trace is typically done by executing a variation of these commands with the filters as desired.
```
diagnose debug flow filter saddr [srcIpAddress]
diagnose debug flow filter daddr [dstIpAddress]
diagnose debug flow filter port [portNumberxxx]
diagnose debug flow show function-name enable
diagnose debug console timestamp enable
diagnose debug flow trace start 100
diagnose debug enable
```
A very good Fortinet KB at [this](https://community.fortinet.com/t5/FortiGate/Troubleshooting-Tip-debug-flow-messages-iprope-in-check-check/ta-p/190119) link covers five potential causes and solutions.

It is a rare scenario but another circumstance when the "iprope_in_check() check failed, drop" message can be observed is if any potentially interfering policy is configured under the local-in-policy settings. 

By default, there should be no policy configured under local-in-policy but when troubleshooting environments that have been setup for a period of time, checking on it is warranted.

For instance, if there is a trusted host configuration put in place that allows certain IP addresses to access the GUI or SSH of the FortiGate device, and there is also a local-in-policy for the same IP, these settings may step on each other. Observed on FortiOS 6.2.11

The trusted hosts config:
```
config system admin
    edit "admin"
        set trusthost1 "10.16.2.15 255.255.255.255"
        set accprofile "super_admin"
        set vdom "root"
        set password ENC xxxxxxxx
    next
end
```
Configuration of a policy directed towards the firewall's local control plane.
```
config firewall local-in-policy
    edit 1
        set interface "port1"
        set srcaddr "OBJ-10.16.2.15"
        set dstaddr "all"
        set service "SSH" "HTTPS"
        set schedule "always"
    next
end
```
This can set up a condition where "iprope_in_check() check failed on policy 1, drop" message is thrown by the flow trace and the HTTPS or SSH request will not function as desired.

Reviewing the local-in-policy, removing or modifying it as needed will resolve the issue in this case.