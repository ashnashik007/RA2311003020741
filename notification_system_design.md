# Notification System Design

This project is a campus notification system frontend. It fetches notifications from the given API and shows them on one page.

## Priority Logic

I used notification type and timestamp to decide priority.

Placement notifications are most important, then Result notifications, then Event notifications.

The weights are:

- Placement: 3
- Result: 2
- Event: 1

If two notifications have the same type, the newer notification is shown first.

## New and Viewed Notifications

When notifications are loaded, they are shown as new. When a user clicks a notification, it is marked as viewed. Viewed notifications become lighter so the user can understand which ones were already opened.

## API Usage

The frontend calls the notifications API using limit and page query parameters. The authorization token is stored in the environment file and passed using the Authorization header.

## Logging

I created a reusable logging function in the logging_middleware folder. The frontend sends logs when notifications are fetched and when errors happen.

## User Interface

The app has buttons for All, Placement, Result, and Event filters. It also has a Top 10 Priority button. The page is kept simple and responsive so it works on desktop and mobile.
