---
title: "How to Monitor Internet Failover Events Using Cisco EEM and Tcl Script"
date: "2019-09-22"
categories: 
  - "valarnet"
tags: 
  - "cisco"
  - "eem"
  - "sla"
  - "tcl"
---

Nowadays many enterprises are adopting SD-WAN deployments. But the majority of enterprise setups are still operating under the traditional WAN topology modes. In this post, I will explore one of the monitoring options available for a redundant Internet link setup connected to a single router.

In situations where you have redundant Internet links as a primary and backup, you would want to know whenever a failover event occurs. As soon as such a failover event takes place, you should be alerted via email and contact Internet service provider if necessary. Again, when the failed link comes back up, you may want to receive a notification that the path is recovered. This can be achieved using EEM (Embedded Event Manager) variables in combination with a Tcl script or alternatively by using an Event Manager applet.

This specific instance I describe below is when you have failover controlled and tracked at the router level. This is to say a router with an IP SLA configuration for ICMP echo-replies, a tracking object and a tracked static route that gets automatically removed from the routing table when a condition is triggered.

To summarize the steps:

- Configure IP SLA, tracking and your tracked routes as you normally would
- Define your Cisco EEM environment variables
- Setup your Tcl script and save it as a file with a .tcl extension
- TFTP the .tcl file you saved to the router’s flash memory
- Specify the Event Manager file’s directory location
- Register the Event Manager policy

The first order of business is to make sure you have your IP SLA, track object and routes configured and running.
```
(config)# ip sla 1
(config-ip-sla)# icmp-echo 8.8.8.8 source-ip 10.10.10.1
(config-ip-sla-echo)# frequency 30
(config)# ip sla schedule 1 life forever start-time now
(config)# ip sla responder
(config)# track 1 ip sla 1 reachability
(config-track)# delay down 60
(config)# ip route 0.0.0.0 0.0.0.0 10.10.10.2 track 1
(config)# ip route 8.8.8.8 255.255.255.255 10.10.10.2
```
After you have that configured, you’d define the Cisco EEM event variables you’ll later be using in the Tcl script.
```
(config)# event manager environment \_mail\_server 10.4.1.23
(config)# event manager environment \_mail\_src\_ip 10.10.10.1
(config)# event manager environment \_mail\_from youremail@organization.com
(config)# event manager environment \_mail\_to technicianemail@organization.com
(config)# event manager environment \_mail\_cc\_to anothertech@organization.com
```
These variables above are just like what you would have in an ordinary programming language. They are values to be used down the line.

If you have numerous IP addresses configured on the router, some of the errors you may potentially experience in the end are SMTP reply code 530 or error in reply. This means the email notification sent by the router is getting denied by your mail server. In such instances, the email needs to be sourced from an IP address that’s trusted; in this case _\_mail\_src\_ip_.

Another consideration is to understand if there is a need to change the default SMTP port number 25 to 587 or 465 etc. That would be specific to your environment and needs to be adjusted accordingly when setting up the config.

Verify what is supported and what is not on your specific router firmware version by checking the EEM version available to you. Some features such as changing the default SMTP port or support for “@” character use in email may not be available in very old versions. Consult the Cisco release notes for specifics.
```
# show event manager version 
Embedded Event Manager Version 4.00
Component Versions:
eem: (rel8)1.0.0
eem-gold: (rel1)1.0.2
eem-call-home: (rel2)1.0.4
```
At this point the EEM variables have been defined and we can proceed to the Tcl scripting segment.
```tcl
::cisco::eem::event\_register\_track 1 state any
namespace import ::cisco::eem::\*
namespace import ::cisco::lib::\*
# This extracts the hostname of your router and assigns it to variable routername
set routername \[info hostname\]
# This requests the status of tracked object (down or up) and assigns it to track\_state
array set track\_info \[event\_reqinfo\]
set track\_state $track\_info(track\_state)
if {$track\_state == "down"} {
action\_syslog msg "Primary Internet Path Down"

set mail\_pre "Mailservername: $\_mail\_server\\n"
append mail\_pre "From: $\_mail\_from\\n"
append mail\_pre "To: $\_mail\_to\\n"
append mail\_pre "Cc: $\_mail\_cc\_to\\n"
append mail\_pre "Sourceaddr: $\_mail\_src\_ip\\n"
append mail\_pre "Subject: $routername PRIMARY INTERNET PATH DOWN\\n\\n"
append mail\_pre "$routername Primary Internet Path Down. \\nPlease investigate and contact ISP if necessary\\n\\n"

set mail\_msg \[uplevel #0 \[list subst -nobackslashes -nocommands $mail\_pre\]\]
if \[catch {smtp\_send\_email $mail\_msg} result\] {
error $result $errorInfo
}
} else {
action\_syslog msg "Primary Internet Circuit UP"

set mail\_pre "Mailservername: $\_mail\_server\\n"
append mail\_pre "From: $\_mail\_from\\n"
append mail\_pre "To: $\_mail\_to\\n"
append mail\_pre "Cc: $\_mail\_cc\_to\\n"
append mail\_pre "Sourceaddr: $\_mail\_src\_ip\\n"
append mail\_pre "Subject: $routername PRIMARY INTERNET PATH UP\\n\\n"
append mail\_pre "$routername Primary Internet Path UP. \\n\\n"

set mail\_msg \[uplevel #0 \[list subst -nobackslashes -nocommands $mail\_pre\]\]
if \[catch {smtp\_send\_email $mail\_msg} result\] {
error $result $errorInfo
}
}
action\_syslog msg "E-mail sent to $\_mail\_to and $\_mail\_cc\_to!"
```
Once you’ve saved your Tcl Script to a file with a .tcl extension, you’d just need to TFTP it to your router. Here I’ll just upload it to flash: directory.
```
#copy tftp flash:
Address or name of remote host \[\]? 10.2.1.25
Source filename \[\]? sendmail.tcl
Destination filename \[\]? sendmail.tcl
```
At this point you’re ready to specify the working directory of the Event Manager by pointing it to the router directory you’ve uploaded the file.
```
(config)# event manager directory user policy "flash:/"
```
Final step is to register the policy as follows
```
(config)# event manager policy sendmail.tcl
```
An important bit to remember when troubleshooting any errors in your script is, after you make any changes to the Tcl script and upload the newly modified .tcl file to your router, you need to reissue a registration for the changes to take effect.
```
(config)# no event manager policy sendmail.tcl
(config)# event manager policy sendmail.tcl
```
That covers the gist of monitoring redundant Internet link failover status controlled by a router using Cisco EEM and a Tcl script. As I mentioned at the top of this post, an alternative approach is to use an Event Manager applet. Yet another method of achieving the same goal would be to simply focus on SNMP traps generated during failover events, collecting the SNMP traps by your favored network management software and setting up alerts based on the trap. API-based and network automation scripting approaches (such as Python) are also worth exploring to achieve the same objectives.
