# server cron jobs
# copy to /etc/cron.d/big-linkus
# MAILTO="mail@dokku.me"
PATH=/usr/local/bin:/usr/bin:/bin
SHELL=/bin/bash

# m   h   dom mon dow   username command
# *   *   *   *   *     dokku    command to be executed
# -   -   -   -   -
# |   |   |   |   |
# |   |   |   |   +----- day of week (0 - 6) (Sunday=0)
# |   |   |   +------- month (1 - 12)
# |   |   +--------- day of month (1 - 31)
# |   +----------- hour (0 - 23)
# +----------- min (0 - 59)
### KEEP SORTED IN TIME ORDER

### PLACE ALL CRON TASKS BELOW

# removes unresponsive users from the subscriber list to decrease bounce rates
*/15 * * * * dokku dokku enter big-linkus cron node bot

### PLACE ALL CRON TASKS ABOVE, DO NOT REMOVE THE WHITESPACE AFTER THIS LINE
