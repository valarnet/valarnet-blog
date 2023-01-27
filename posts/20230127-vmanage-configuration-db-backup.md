---
title: "vManage GUI Not Loading - Backup Configuation DB"
date: "2023-01-27"
categories: 
  - "valarnet"
tags: 
  - "sdwan"
---

When my home SD-WAN lab running in EVE-NG corrupted due to power failure, it had me lose hours of setup, Ever since, I've been regularly backing up the configuration DB to be ready when a restore is needed. Testing the restoration also has helped out in recovering state.

One of the things that can happen due to a corrupted vManage configuration DB is the VManage GUI may end up being unable to load. There seems to be a dependency where if the configuration-db NMS process is unable to run then the application server can't initialize either. The application server process is what makes the vManage GUI accessible. 

Typically the application server can take 5 to 10 minutes to fully start. Patience is warranted here but if, for some reason, you are unable to load the vManage GUI in EVE-NG, the state of the NMS processes would be one place to start looking.

A faulty initialization can show that some of the processes remain stuck in "waiting" state.

```md
vManage# request nms all status
NMS application server
	Enabled: true
	Status:  <waiting>
NMS configuration database
	Enabled: true
	Status:  <waiting>
NMS coordination server
	Enabled: true
	Status:  running PID:3515 for 642s
NMS messaging server
	Enabled: true
	Status:  running PID:5159 for 626s
NMS statistics database
	Enabled: true
	Status:  running PID:3230 for 643s
NMS data collection agent
	Enabled: true
	Status:  not running
NMS cloud agent
	Enabled: true
	Status:  running PID:425 for 659s
NMS container manager
	Enabled: false
	Status:  not running
NMS SDAVC proxy
	Enabled: true
	Status:  running PID:511 for 659s
```

In this situation, an error message that may be observed when diagnosing the configuration-db process is the "Unable to connect to localhost:7687 (127.0.0.1:7687) Connection refused."

```md
vManage# request nms configuration-db diagnostics
```

Once it goes in to the localhost connection refused state, I have not been able to fix the vManage or recover it as it is. The only recourse I had to take was to rebuild a new vManage and start the controller integration and vEdge onboarding all over again. This was quite the waste of time I didn't need.

### Backup vManage Configuration DB from CLI

To backup from the CLI, use the **"request nms configuration-db backup path [PLACEHOLDER]"** command. This would save a backup to the specified "path"; or so one would think. 

Keep in mind that backup using this method will save a local copy of the configuation-db. If the server itself is lost, then the backup becomes inaccessible and useless. Ideally, there needs to be a process in place to copy the backup file out of the server to a remote backup location.

When using this command, there's some annoying quirk I'd need to mention.  It has to do with how the [PLACEHOLDER] is specfiied. 

```md
vManage# request nms configuration-db backup ?
Possible completions:
  path   Local directory path /opt/data/backup)
```

If you put a / in front of home like a path in regular linux, for example, it would complain with a syntax error.
```md
vManage# request nms configuration-db backup path /home/admin
-----------------------------------------------------^
syntax error: not a file
```
The error states it is expecting a file, not a path.

Use the command without / and the backup will kickoff. 

```md
vManage# request nms configuration-db backup path home/admin
Starting backup of configuration-db
config-db backup logs are available in /var/log/nm/neo4j-backup.log file
mv: cannot move '/opt/data/backup/tmp.dNYJmydLsq' to '/opt/data/backup/home/admin.tar.gz': No such file or directory
chown: cannot access '/opt/data/backup/home/admin.tar.gz': No such file or directory
chmod: cannot access '/opt/data/backup/home/admin.tar.gz': No such file or directory
Successfully saved database to /opt/data/backup/home/admin.tar.gz
```
It'll do its thing but it will save the file to /opt/data/backup/home/admin. Weird. Right? It appends the /opt/data/backup/ to whatever is specfied after path.  It does this all the while complaining that the prvided directory or file doesn't exist.

To my mind. what makes sense is the "path" keyword in the command isn't a fully appropriate label. What the command seems to be expecting is to be provided a **path to a file including the file name.** 

```md
vManage# request nms configuration-db backup path RandomFileName
Starting backup of configuration-db
config-db backup logs are available in /var/log/nm/neo4j-backup.log file
Successfully saved database to /opt/data/backup/RandomFileName.tar.gz
```
It appends /opt/data/backup/ automatically and saves the file in that directory. Checking in vShell shows that the admin user has ownership over the compressed backup file that was just created.
```md
vManage:~$ ls -al /opt/data/backup/
total 2808
drwxrwxrwx  3 vmanage vmanage         4096 Jan 27 16:57 .
drwxr-xr-x 13 vmanage vmanage-admin   4096 Jan  8 17:11 ..
-rwxrwxr-x  1 vmanage admin         531648 Jan 27 16:55 RandomFileName.tar.gz
drwxr-xr-x  3 root    root            4096 Jan 27 16:55 staging
-rw-------  1 root    root          533580 Jan 27 16:03 tmp.1wZ6xyvu3U
-rw-------  1 root    root          345679 Jan 14 16:53 tmp.RLPHYNeNWF
-rw-------  1 root    root          532696 Jan 27 16:42 tmp.dNYJmydLsq
-rw-------  1 root    root               0 Jan 27 16:54 tmp.ggskXaZRQu
-rw-------  1 root    root          347228 Jan 14 16:52 tmp.iRRdTvM5Db
-rw-------  1 root    root          534396 Jan 27 16:04 tmp.laMpYnXaCg
```

A properly running vManage server would return an NMS status output similar to the following, The NMS processes will run if they're enabled. It'll also display the Process ID and for how long the process has been running.

```md
vManage# request nms all status
NMS application server
	Enabled: true
	Status:  running PID:6006 for 160253s
NMS configuration database
	Enabled: true
	Status:  running PID:3270 for 160279s
NMS coordination server
	Enabled: true
	Status:  running PID:3239 for 160279s
NMS messaging server
	Enabled: true
	Status:  running PID:4891 for 160263s
NMS statistics database
	Enabled: true
	Status:  running PID:3297 for 160279s
NMS data collection agent
	Enabled: true
	Status:  running PID:7333 for 160237s
NMS cloud agent
	Enabled: true
	Status:  running PID:427 for 160294s
NMS container manager
	Enabled: false
	Status:  not running
NMS SDAVC proxy
	Enabled: true
	Status:  running PID:536 for 160294s
```
The state pf these processes can also be displayed from inside the vManage GUI. This is only helpful when the application server process is working ok and you are able to log in to the GUI.

![](/static/img/vmanage-gui-process-status.png)

As far as I have looked, there doesn't appear to be a way to take or schedule database backups from the vManage GUI. Of course one can use the SSH Terminal Tool CLI from inside the vManage GUI, but that still is really not a GUI function.

![](/static/img/vmanage-cli.png)

To test the backup, simply use the restore version of the request nms configuration-db command.

```md
vManage# request nms configuration-db restore path [PATH_TO_THE_BACKUP_FILE_INCLUDING_THE_FILE_NAME]
```

Take your backups. Test them regularly. Save time and unnecessary trouble.