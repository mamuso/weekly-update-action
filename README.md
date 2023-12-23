# Weekly Update Action

[![Build and Test](https://github.com/mamuso/weekly-update-action/actions/workflows/test.yml/badge.svg)](https://github.com/mamuso/weekly-update-action/actions/workflows/test.yml)

An action for creating a weekly GitHub discussion. It has the option of posting in advance and sending a reply to the post later in the week as a reminder.

These are the configurable options:

post_on: Day to create the discussion (Default: Mon).
remind_on: Day to send a progress update reminder (Default: empty).
advance_on: Day to post the discussion ahead of schedule (Default: empty).
title: Discussion title (Default: Weekly Update (Default: Weekly Update ({{date}})).
category: Discussion category (Default: General).
repo: Repository for the discussion (Default: empty).
token: GitHub token/PAT (Default: empty).
post_template: Markdown file for discussion post (Default: .github/weekly-post.md).
reminder_template: Markdown file for reminder reply (Default: .github/weekly-reminder.md).

- `post_on` - Day to create the discussion (default: `Mon`)
- `remind_on` - Day to send an update reminder (default: empty)
- `advance_on` - Day to post the discussion ahead of schedule (default: empty)
- `title` - Discussion title (default: `Weekly Update ({{date}})`)
- `category` - Discussion category (default: `General`)
- `repo` - Repository for the discussion (default: empty`)
- `token` - GitHub token/PAT (default: empty)
- `post_template` - Markdown file for discussion post (default: `.github/weekly-post.md`)
- `reminder_template` - Markdown file for reminder reply (default: `.github/weekly-reminder.md`)
- `lables` - List of labels. This is a multiline field. Labels should exist in the repository (default: empty)

The action finds discussions by title. Use date or shortdate in titles/templates for automatic date processing.

- `Team update - Week of {{date}}` will transform into `Team update - Week of January 2, 2023`.
- `Team update - {{shortdate}}` will transform into `Team update - January 2023`.

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

### Running multiple updates with a single workflow file

If you need to run posts for different teams, but you want to use a single workflow file, you can use a matrix handle the case. For example, if you have two teams, you can create a workflow file like this:

```yaml
name: Teams Weekly Update

on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

jobs:
  weekly-test:
    name: Teams Weekly Update
    strategy:
      matrix:
        teams:
          - {title: Product Design, path: product-design}
          - {title: Design Systems, path: design-systems}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: mamuso/weekly-update-action@main
        with:
          post_on: Mon
          repo: ${{ github.repository }}
          token: ${{ secrets.GITHUB_TOKEN }}
          title: ${{ matrix.teams.title }} Team - Week of {{date}}
          post_template: .github/${{ matrix.teams.path }}-post.md
```

You will also need to create two markdown files in your repository: `.github/product-design-post.md` and `.github/design-systems-post.md`.

![Running multiple updates with a single workflow file](https://user-images.githubusercontent.com/3992/211471996-7328aa46-ab61-46c0-a17d-92543d941fa4.png)

### Monthly post

Changing the cron schedule, you can create a monthly post. In this case:

- The action will run every day between the 23rd and the 31st of the month
- As this is a monthly event, we will use `shortdate` to create the title of the discussion

For that, you should create a new workflow file in your repository, for example, `.github/workflows/monthly-post.yml`, with the following content:

```yaml
name: Monthly Business Review Agenda

on:
  schedule:
    - cron: '0 8 23-31 * *'
  workflow_dispatch:

jobs:
  step:
    name: Monthly Business Review Agenda
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: mamuso/weekly-update-action@main
        with:
          post_on: Mon
          advance_on: Fri
          title: Monthly Business Review - {{shortdate}}
          category: General
          repo: ${{ github.repository }}
          token: ${{ secrets.GITHUB_TOKEN }}
```

![Running a 'Monthly post'](https://user-images.githubusercontent.com/3992/211470297-2df440fa-bf2d-4268-99f1-d6264cc0c195.png)

### Labeling discussions

Using the labels input, you can assign labels to the discussion. Enter each label on a new line in this multiline field. Make sure the labels already exist in your repository. If they don't, the action will ignore them.

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
          labels: |
            weekly
            😎 teamwork
```
