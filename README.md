# Weekly Update Action

This action will create a new GitHub discussion to request weekly updates from the team.

## Use cases

### Running a weekly 'standup' discussion

You can automate the creation of a new discussion every week to request updates from the team. In this case:

- The action will create a new post every Monday at 9am UTC (or the day you specify)
- The action will add a reply to the discussion on Thursday (or the day you specify) reminding folks to update with their progress

For that, you should create a new workflow file in your repository, for example `.github/workflows/weekly-update.yml`, with the following content:

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

![Running a weekly 'standup' discussion](https://user-images.githubusercontent.com/3992/211125969-80b2f944-c895-4b2c-a06d-f19a4bc7ecff.png)
