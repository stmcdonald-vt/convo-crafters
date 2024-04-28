# Convo Crafter

## About Convo Crafter
This Slack bot helps alleviate friction when setting up, participating in, and following-up on meetings. The bot allows team members to schedule meetings, set a meeting agenda, set reminders, and follow-up by assigning action items.

## Installation

As a "next-generation" slack application, Convo Crafter, requires [a Slack paid plan](https://slack.com/pricing) to install it into a workspace. In this section we'll cover how to install it to a workspace.

### Install the Slack CLI

First, you need to install and configure the Slack CLI. Step-by-step instructions can be found in the
[Slack CLI Quickstart Guide](https://api.slack.com/automation/quickstart). You only need to complete installation and authorization steps step as you will be deploying this application instead of a template.

### Clone this Repository

Clone this repository to your local machine so it can be deployed.

### Deploy to Your Workspace

You can deploy Convo Crafter to your Slack workspace with `slack deploy`:

```zsh
$ slack deploy
```

When deploying for the first time, you'll be prompted to [create a new link trigger](#creating-triggers). Select **configure_triggers_trigger** as this will be used to set up the bot in your Slack channels. 

### Running the Trigger Configurator

After deploying Convo Crafter to your workspace, you should see a link trigger was created. Copy the link trigger and paste it into your personal Direct Message channel. This workflow will prompt you to add the bot to a channel of your choosing. You can add the bot to as many channels as you wish.

## Using Convo Crafter
All functionalities of this bot are triggered using links that are added as bookmarks to the top of each channel. An example workflow for using the bot is outlined below.

### Create a Meeting

Convo Crafter's functionality revolves around Meetings. You can use the "Create Meeting" function to pick a time and place (channel) that you want to have the meeting in. Once you create that meeting, you'll see a message thread with buttons to set agenda items and reminders for the meeting.

### Starting a Meeting

As the scheduled meeting time approaches, your team can use the "Start Meeting" function which will create a meeting notes message thread. This message thread displays the agenda for the meeting along with a button to assign action items as they become apparent during the meeting

### During the Meeting

One of the main key features of Convo Crafters is meeting flow control. The "Next Topic" function gives meeting participants an opportunity to discreetly request to the current meeting speaker that the team move onto the next topic. 

### After the Meeting

Team members will automatically receive a notification to remind them when an action item is nearly due. Action items can be viewed on a per-member basis to help them keep track of what they need to follow-up on.