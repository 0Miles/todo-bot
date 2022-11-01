# Todo Karyl
<img src="https://i.imgur.com/1YbH4xE.gif" width="180">

## Overview
Discord todo list bot.  
There may be other features.
  
## Getting Started
1. npm install
```
npm i
```
2. Setup bot token
```
// bash
export BOT_TOKEN=REPLACE_THIS_WITH_YOUR_BOT_TOKEN

// cmd
set BOT_TOKEN=REPLACE_THIS_WITH_YOUR_BOT_TOKEN

// powershell
$ENV:BOT_TOKEN="REPLACE_THIS_WITH_YOUR_BOT_TOKEN"
```
3. Run
```
npm start
```

## Todo channel
Use discord channel as a todo list.  
A message that mentions someone is considered a todo, and any reaction emoji is attached to the message to indicate that the todo is done.  
Mention the bot when you want to see undone todos. The bot will pull all undone todos to channel bottom.

### Commands
 - ``/todo-channel watch`` Watch the current Channel as a todo list.  
 - ``/todo-channel stop-watch`` Stop watching the current channel as a todo list.
 - ``/todo-channel check-cache`` Check cache message.
  

## Role emoji
Allows guild members to acquire desired roles by attaching reaction emoji to designated message.  

### Commands
 - ``/role-emoji add`` Add a new role emoji.  
 - ``/role-emoji remove`` Remove a role emoji.
 - ``/role-emoji list`` List all role emoji.
 - ``/role-emoji watch-message`` Watch a message's reactions.
 - ``/role-emoji stop-watch-message`` Stop watching a message's reactions.
