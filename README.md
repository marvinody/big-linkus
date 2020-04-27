# [Git Stalked](https://stalker.deploy.sadpanda.moe/)

An experiment in being creepy

What if you could type in someone's Github username and pull their email, and any email on any repo they created or forked? That would be creepy. But I did it anyway since it's public information. People actually put some email into git and that's all it's doing. Looking to see what email they provided to git at some point.

## How?

Basic idea is to clone the repository and go through all the commits checking for any emails associated with the commits. Then clean it up a bit and send them back.

## Tech stack

Written in Svelte/Sapper with a Express/PostgreSQL.
