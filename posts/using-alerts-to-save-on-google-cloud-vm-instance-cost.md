---
title: "Using Alerts to Save on Google Cloud VM Instance Cost"
date: "2022-06-18"
categories: 
  - "valarnet"
tags: 
  - "gcp"
  - "google"
---

TLDR of problem to solve: **I do not want to forget and let cloud virtual machines run **when I'm not actively using them.** That's where I've set up my test networking labs. For every minute it runs, it costs.** **Set up total **uptime** alerts and get notified. Wherever you are, log in to the Google Cloud Console mobile app (iOS, Android,...) and stop the virtual machine.**

I run my networking test labs ([GNS3](https://www.gns3.com/) and [EVE-NG](https://www.eve-ng.net/)) on virtual machines in Google cloud. This is due to the nested-virtualization (virtual machine inside a virtual machine) feature that Google cloud makes available in its VM instances which AWS EC2 and Azure VM instances do not. [Side-note 1.](#side-note-1)

The nested virtualization capability is necessary to be able to spin up Qemu images. Instances such as an Arista vEOS, FortiOS, or Cisco IOSv require it to be able to run on say an Ubuntu VM. [Side-note 2.](#side-note-2)

> For anyone who wants to get started with it, Google cloud even gives [free 3 months or $300 of free access](https://cloud.google.com/free/docs/gcp-free-tier/#free-trial) (whichever happens first).

To avoid forgetting a VM running and costing needlessly, it's easy to set up alerts.

Simple to set up but no technology or feature should be judged by its complexity. The only worth metrics are the amount of good it can do and the value it provides.

There are only a few steps to it:

**Step 1.** Navigate to **Monitoring > Alerting** or just type "alert" in the search bar at the top middle of the screen.

![](/static/img/image-22.png)

**Step 2.** Create policy

![](/static/img/image-23.png)

**Step 3.** **Select a metric > VM Instance > Instance > Uptime Total**. Then click **Apply**

![](/static/img/image-24.png)

**Step 4.** Change the "Transform data" if you like but for me, the defaults work fine for this. Scroll down and click **Next**

![](/static/img/image-25.png)

**Step 5.** For the alert trigger configuration, set the threshold you want to be notified at. Threshold value is in milliseconds.

> It's weird that the unit you need to input here is in milliseconds. Convert your threshold to milliseconds. For example, I want to be notified if the total uptime of a virtual machine instance goes above 3 hours (i.e. 10800000 milliseconds).
> 
> When first setting this up, you can test this with a 5 minute (300000 milliseconds) value just to validate you get notifications as required. Then increase to the actual value once you have confirmed it works.

It's not required but change the "Condition Name" if you wish to.

Click **"Create Policy"**

![](/static/img/image-26.png)

**Step 6.** Next set up how you want to be notified. There are a variety of ways. For me, I'd like to get an email and SMS message alert. When you click in the "Notification channels" box, it gives you the options to manage these.

![](/static/img/image-28.png)

**Step 7.** Follow the **"Manage Notifications Channels"** It opens in a new tab - which is nice (small details like this make the user experience!).

If you scroll a little bit lower, you should see the options listed.

![](/static/img/image-29.png)

It is self-explanatory what needs to be done here. Follow the **"ADD NEW"** buttons for all the means of notification you want and set yourself up.

> I find it odd that it doesn't ask me to confirm the email address but asks to confirm the phone number. Does this mean I can email spam whoever I want with alerts?

![](/static/img/image-30.png)

![](/static/img/image-31.png)

**Step 8.** Return to the browser tab you were on in **Step 6** where the **"Configure notifications and finalize alert"** is. Click the **refresh icon** to the left of "Manage Notification Channels"

The Email and SMS channels you created will be available to select. I only did email for this case and it's there.

Select and click OK

![](/static/img/image-32.png)

If you scroll down, there are two fields that need to be filled out.

It's a good idea to put a description on it. Future you will always be thankful for it. And it is required to give a name for the alert policy. I named mine "vm-instance-uptime-total"

Click **Next** to review.

![](/static/img/image-33.png)

**Step 9.** The review page will appear.

![](/static/img/image-34.png)

The red dotted line shows the threshold at which the trigger will fire and a notification sent to you. Notice Google doesn't display the last three zeros 000 here. It took them away from the 10,800,000 milliseconds (i.e. 3 hours I wanted to be alerted on) and shows 10,800.

> Side-note: My inclination is this unit should be in minutes (ok…at most seconds). I can't think of use cases where a VM instance will need to be checked against an uptime total in the low millisecond range. In any case, that's how it is now and Google may have a reason for it.

After reviewing, click **Create Policy.**

When the uptime total goes above the threshold (3 hours in my case), I receive an alert. Wherever I may be at that time, I open up the Google Cloud Console app on my mobile phone and stop the virtual machine.

That's it. Very simple steps. But guaranteed to save you some cost due to forgetting to spin down a VM after using it.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**SIDE NOTES**

Side-note 1: There's nuance here but I'd argue AWS and Azure generally don't support nested VMs. You'd have to twist and contort your machine choices to make it. Not in Google cloud. Smooth sailing.

Side-note 2: I'm a Google cloud "fanboy" and welcome every opportunity to play there. Unfortunately, it's not as widespread in customer use yet as the other providers. In my opinion, Google cloud deserves what I pay it for how it is organized, neatly documented, and how accessible it has made itself for my personal use. Obviously, I want to pay only for what I use. That's the promise of the cloud model.
