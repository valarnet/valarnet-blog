---
title: "Block-Level, File-Level and Object-Based Storage Systems"
date: "2019-09-08"
categories: 
  - "valarnet"
tags: 
  - "network"
  - "storage"
---

A topic that came up recently in a discussion and seems to be categorized under one of those “we already knew that” files is the area of basic storage system technologies. I’ve found it’s not articulated well enough in my discussions.

Because the often taken-for-granted fundamentals are what drive any higher level technology implementation, in this blog post I’ll attempt to expound on this particular area. I’ll skip the ancient history blathering about punched cards, drum memory, ferromagnetic tapes and how they evolved.

Since the early days of computing, at the heart of it, is a need to account for data storage: modification (write operations) and retrieval (read operations).  It goes without saying that in such interactions there are two components: 1) a writer/reader most commonly referred to as an Initiator and 2) the destination that is to be written to or read from; most commonly termed “Target.” These two components are usually located in different parts of a network. As you read through this post, keep that at the forefront of your mind as the necessity that was intended to be addressed .

The difference in implementation of storage systems technologies stems from how data is consumed. More plainly, how data is read from or written to the storage device. If data is consumed in blocks, it’s called block-level storage. If data is consumed as a file, it’s termed file-level storage. If data is consumed as an object, it’s termed object-based storage.

Now let’s see each one separately and explain what is meant by block, file and object. Understanding what these three are is critical to understanding the differences between these methods.

**Block-Level Storage**

A block can loosely be likened to a single container on a freight ship. Except in this case the underlying freight ship is replaced with the physical storage device. A block represents a chunk of data on a physical storage device which can be accessed with a specific address on the storage space; just as one can precisely point to a container on a ship by counting the row, column and height it’s located at.

One very important factor for high performance data input/output is the block size. The ability/inability to lift a 4KB block versus a 512KB of block in a single cycle of operation has an impact on the total data transfer that can be performed during a certain period of time. Delving deeper on this requires a detailed explanation of the architectures and some arithmetic. But regardless the storage architecture used, block size is an important factor for performance and throughput. I’ll keep this post focused on the basic concepts.

![](https://valarnet.com/wp-content/uploads/2019/09/block-level-storage-1.png?w=308)

Accessing each block cannot be left to go on in the etiquette of the wild West. There need to be basic rules of access to ensure integrity of data and avoid corruption or loss of it. For this reason, we need protocols to control/facilitate communication between an Initiator (read/write operation requester) and a Target (storage space to be written to or read from.) The Initiator can be server-based operating systems (Windows, Linux, etc) and the Targets storage devices (JBODs of any type, EMC, NetAPP, etc.)

The two most important block-based protocols are SCSI (Small Computer System Interface) and FC (Fibre Channel). These protocols are considered block-based because they operate (read or write) on a block of data.

**File-Level Storage**

File-level storage gets its name from the fact the data unit that is operated on is a file or folder. Files and folders can be made of many blocks but using file-level storage technologies one can not modify or separately access the individual blocks themselves. File and folder hierarchy is an important attribute in this method.

![](https://valarnet.com/wp-content/uploads/2019/09/file-level-storage.png?w=322)

To control/facilitate file-based storage operations over a network we need protocols. The most popular file-based storage protocols are NFS (Network File System) protocol and SMB (Server Message Block) protocol.

> Side note: A now rarely used older version of the SMB protocol is the CIFS (Common Internet File System.) CIFS basically was a way of sending file-based read/write commands using SMB over NetBIOS over TCP/IP. SMB2 and SMB3 protocols eliminated the dependency on NetBIOS and provided an option to access file systems using SMB protocol directly over TCP/IP.

**Object-Based Storage**

Similarly, object-level storage derives its name from the fact that the data units that are operated on (read or write) are organized in the form of objects. If you have a little bit of object-oriented programming background, you probably are already familiar with objects.

An object has specific attributes that make it what it is. A chair, for example, can be characterized by the material it is made of, its size, how many legs it has, its color, its maker and so on.

An object in storage systems contains three main elements:

1. The data itself
2. Information about the data (metadata) such as when it was created, who created it, who is allowed to access it and who isn’t, what its purpose is, etc. The object’s metadata lives directly in the object.
3. A globally unique Object ID that identifies the object’s address (where it is located on the storage space.)

Object-based storage is a relatively newer technology that is gaining adoption in cloud environments for the advantages it provides in scalability and efficiency in accessing distributed storage spaces.

In object-based storage, as in block-based or file-based storage, a protocol is required. Some of the competing protocols currently available include [Amazon S3](http://docs.aws.amazon.com/AmazonS3/latest/gsg/AmazonS3Basics.html), EMC [Atmos](https://www.emc.com/collateral/software/white-papers/h9505-emc-atmos-archit-wp.pdf), OpenStack [Swift](https://wiki.openstack.org/wiki/Swift), [Ceph](https://ceph.com/ceph-storage/object-storage/) and so on.

To create, get or modify objects in object-based storage, we use what is knows as a REST (REpresentational State Transfer) API. A REST API provides functions which can be used to perform  standard HTTP GET and POST requests and responses. For a very good primer on what a REST API is watch this [video.](https://www.youtube.com/watch?v=7YcW25PHnAA)

The optimal use cases for these technologies differ because each has its own advantages and limitations compared to the other. Few of the most important metrics include performance, scalability and simplicity in access.
