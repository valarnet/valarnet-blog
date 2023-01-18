---
title: "Linux Commands to Use with the CCIE Host VM"
date: "2023-01-18"
categories: 
  - "valarnet"
tags: 
  - "linux"
---

The CCIE Host VM is a Debian-based linux system that has been customized and stripped of many functionalities. Basic knowledge of how to deal with linux interfaces and networking can be useful in a test where every minute counts.

The VM I downloaded for use with EVE-NG (following reference from Cisco [webinar](https://learningnetwork.cisco.com/s/question/0D53i000017uwFnCAI/ccie-enterprise-infrastructure-build-your-own-lab-and-beyond-post-webinar-open-discussion-thread)) is converted by Jordi Schlooz and can be found at [this](https://www.theansweris101010.network/its-here-the-ccie-lab-image/) link

```md
cisco@host1: uname -a
Linux host1 5.5.0.1 amd64 #1 SMP Debian 5.5.13-2 (2020-03-30) x86_64 GNU/Linux
```

### Linux commands to use on the CCIE Host VM

The LX Terminal comes pre-installed on the VM.

To display the host's link or IP address information, there are multiple options. Issue each command and in the outputs you'll notice differences between the displayed interfaces with varying levels of detail provided.
```md
ip link show
ip addr
sudo ifconfig
ip -4 a
```

To display the interfaces configuration file, use *cat* command. Sudo is optional here because cat is only reading the file.
```md
sudo cat /etc/network/interfaces
```

To edit interface IP configuration information in the network interfaces configuration file, again, there are multiple options available. 

**Option 1: Vi.** Open the configuration file in an editor (vi) in this case.
```md
sudo vi /etc/network/interfaces
```
Hit "i" to insert new line of text. The line doesn't matter as long as the entry is correct. I typically insert just below the *iface lo inet loopback*

Save the changes made in vi editor by hitting the ESC key then typing :wq!

**Option 2: Nano.** Alternatively, if you prefer the nano editor, that is also an option.
```md
sudo nano /etc/network/interfaces
```
To save nano editor changes hit Ctrl X then Y and hit ENTER. To discard the changes, use N.

**Option 3: gEditor.** If you don't want to deal with command line text editing, use the gEditor GUI and make/save changes in a familiar GUI space. 
```md
sudo gedit /etc/network/interfaces
```
To save the changes, there is a "Save" button on the top right corner of the editor window.

Add the required interface and IP address information for the interface. Typically, ens192 is commonly used in the practice labs. *Note: As is the case with the VM image I have in my EVE-NG, the VM may be using different interface naming other than ens192 such as ens3 or ens4. But that is minor. Just make sure to identify and use the correct interface names in the configuration file.*
```md
iface ens192 inet static
	address 192.168.1.30
	netmask 255.255.255.0
	gateway 192.168.1.1
```

Bring up the interface
```md
sudo ifup ens192
```

Verify the interface has the IP address
```md
sudo ifconfig ens192
```

To check the Linux host's routing table, *netstat -rn* can be used
```md
netstat -rn
```

**Note**: If you made a configuration mistake or typos when initially setting up the interface and then made corrective changes in /etc/network/interfaces configuration file, these changes do not take effect automatically. Bringing down (sudo ifdown ens192) and then bringing up the interface (sudo ifup ens192) can help. If that still doesn't resolve the issue, try restarting the networking process (sudo /etc/init.d/networking restart) and bring up the interface again.

To restart the networking process, either a single command restart, or a two command stop/start option can be used. 
```md
sudo /etc/init.d/networking restart
or,
sudo /etc/init.d/networking stop
sudo /etc/init.d/networking start
```

From here, bring up the interface and proceed with verifying that the interface comes up and that the changes you made have taken effect.
```md
sudo ifup ens192
```

Use the link and IP address commands to compare the output and format of the commands.
```md
ip link show
ip addr
sudo ifconfig
ip -4 a
```

To verify if this is a persistent change or  if it gets lost up on reboot, reboot the VM.
```md
sudo reboot
```

Checking the interface status shows that the ens192 interface we configured and brought up is not displayed.
```md
sudo ifconfig
```

Checking the contents of the /etc/network/interfaces file shows the changes are still there
```md
cat /etc/network/interfaces
```

The problem is ens192 is not set to automatically come up on reboot. Instead of doing "sudo ifup ens192" after every reboot, let's change that by adding an "allow-hotplug ens192" to the configuration file.
```md
allow-hotplug ens192
iface ens192 inet static
	address 192.168.1.30
	netmask 255.255.255.0
	gateway 192.168.1.1
```

Test a reboot now and the interface should come up automatically with the configured IP information.

### DHCP on Linux VM Host
The method described above is usable whenwe are configuring IP address is statically.

However, if a DHCP server is used to provide IP addressing, DHCP request and releases can be triggered from the host VM by using the dhclient command. The -r is for the release option and -v is to display verbose output when a DHCP request runs.
```md
sudo dhclient ens192 -r
sudo dhclient ens192 -v
```

That should be sufficient to navigate the Host VM aspect of the exam, hopefully.