---
title: "EVE-NG GUI Login Not Working"
date: "2024-09-11"
categories: 
  - "valarnet"
tags: 
  - "networking"
---

If EVE-NG GUI login fails:
- SSH to the EVE-NG server and validate if the hard disk is full by using **df -h** linux command. If it is full, you may need to find out why and clear up space.

If the hard disk is not full, run the following commands from an SSH session.

Fix permissions:
```
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

Restore the DB:
```
unl_wrapper -a restoredb
```