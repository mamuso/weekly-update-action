# Weekly Update Action

[![Build and Test](https://github.com/mamuso/weekly-update-action/actions/workflows/test.yml/badge.svg)](https://github.com/mamuso/weekly-update-action/actions/workflows/test.yml)

This action will create a new GitHub discussion to request weekly updates from the team.

These are the configurable options:

- `post_on` - the day of the week to create the discussion (default: `Mon`)
- `remind_on` - the day of the week to remind folks to update their progress (default: empty)
- `advance_on` - the day of the week to create the discussion a few days ahead of the post day (default: empty)
- `title` - the title of the discussion (default: `Weekly Update ({{date}})`)
- `category` - the category of the discussion (default: `General`)
- `repo` - the repository to create the discussion in (default: empty`)
- `token` - the GitHub token or PAT that you want to use (default: empty)
- `post_template` - the name of the markdown file to use as the template for the discussion post (default: `.github/weekly-post.md`)
- `reminder_template` - the name of the markdown file to use as the template for the reminder reply to the post (default: `.github/weekly-reminder.md`)

## Use cases

### Running a weekly 'standup' discussion

You can automate the creation of a new discussion every week to request updates from the team. In this case:

- The action will create a new discussion every Monday at 8 am UTC (or the day you specify)
- The action will add a reply to the discussion on Thursday (or the day you specify), reminding folks to update their progress

For that, you should create a new workflow file in your repository, for example, `.github/workflows/weekly-update.yml`, with the following content:

```yaml
name: Weekly Update

on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

jobs:
  step:
    name: Weekly Update
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: mamuso/weekly-update-action@main
        with:
          post_on: Mon
          remind_on: Thu
          title: Team update - Week of {{date}}
          category: Show and tell
          repo: ${{ github.repository }}
          token: ${{ secrets.GITHUB_TOKEN }}
```

You will also need to create two markdown files in your repository:

- `.github/weekly-post.md` - this will be the template for the discussion post
- `.github/weekly-reminder.md` - this will be the template for the reminder reply to the post

![Running a weekly 'standup' discussion](https://user-images.githubusercontent.com/3992/211126881-8e60f290-d56f-4a20-8d3f-bb870d345922.png)

### Monday minutes

You can create a "Monday minutes" post, where you can open a discussion a few days ahead of the post day. In this case:

- The action will create a new discussion every Friday at 8 am UTC (or the day you specify), with the title "Monday Minutes" and the date of the next Monday

For that, you should create a new workflow file in your repository, for example, `.github/workflows/monday-minutes.yml`, with the following content:

```yaml
name: Monday Minutes

on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

jobs:
  step:
    name: Monday Minutes
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: mamuso/weekly-update-action@main
        with:
          post_on: Mon
          advance_on: Fri
          title: Monday Minutes - {{date}}
          category: General
          repo: ${{ github.repository }}
          token: ${{ secrets.GITHUB_TOKEN }}
```

You will also need to create a markdown file in your repository:

- `.github/weekly-post.md` - this will be the template for the discussion post. If you want to use a different name, you can include a `post_template` input to the action.

![Running a 'Monday minutes' post](https://user-images.githubusercontent.com/3992/211245515-41b8b9f3-e8b3-48c9-8434-64c591267fc9.png)
