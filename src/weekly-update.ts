//
//  weekly-update.ts
//
import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import type {GraphQlQueryResponseData} from '@octokit/graphql'
import type {configuration} from './types'
import * as fs from 'fs'

export default class weeklyUpdate {
  configuration: configuration
  route: string
  today: string
  executedToday: boolean
  token: string
  graphqlWithAuth: typeof graphql
  repoOwner: string | undefined
  repoName: string | undefined

  // ----------------------------------------------------
  //  Kick off the action
  // ----------------------------------------------------
  constructor(actionConfiguration: configuration) {
    // Set the configuration defaults
    this.configuration = {
      repo: actionConfiguration.repo || null,
      post_on: actionConfiguration.post_on || 'Mon',
      advance_on: actionConfiguration.advance_on || null,
      remind_on: actionConfiguration.remind_on || null,
      title: actionConfiguration.title || 'Weekly Update ({{date}})',
      post_template:
        actionConfiguration.post_template || '.github/weekly-update-request.md',
      remind_template:
        actionConfiguration.remind_template ||
        '.github/weekly-update-reminder.md'
    }

    // ----------------------------------------------------
    //  Read and transform the templates
    // ----------------------------------------------------

    // Toaday date and route initialization
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'short'
    })
    this.executedToday = false
    this.route = ''

    // Set up the repository owner and name
    if (this.configuration.repo != null) {
      const repo = this.configuration.repo.split('/')
      this.repoOwner = repo[0]
      this.repoName = repo[1]
    } else {
      this.repoOwner = process.env.GITHUB_REPOSITORY_OWNER
      this.repoName = process.env.GITHUB_REPOSITORY_NAME
    }

    // Grab the token
    this.token = core.getInput('token', {required: true})

    // Initiazlize the GraphQL client
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${this.token}`
      }
    })
  }

  // Trigger the action
  async run(): Promise<void> {
    try {
      // Check if the action should be executed today
      if (
        [
          this.configuration.advance_on,
          this.configuration.post_on,
          this.configuration.remind_on
        ].includes(this.today)
      ) {
        // Update the title with the next post_on date
        const postOnDateStr = this.getPostDate()
        this.configuration.title = this.configuration.title?.replace(
          '{{date}}',
          postOnDateStr
        )

        // Read post template
        let postTemplate = this.readTemplateFile(
          this.configuration.post_template
        )
        if (postTemplate) {
          postTemplate = postTemplate.replace('{{date}}', postOnDateStr)
        }

        // Read post template
        let remindTemplate = this.readTemplateFile(
          this.configuration.remind_template
        )
        if (remindTemplate) {
          remindTemplate = remindTemplate.replace('{{date}}', postOnDateStr)
        }

        switch (this.today) {
          case this.configuration.advance_on: {
            // Advance the week
            this.route = 'advance'
            const discussionId = await this.getDiscussionPost()
            if (discussionId) {
              return
            }
            break
          }
          case this.configuration.post_on: {
            // Post the weekly update
            this.route = 'post'
            // eslint-disable-next-line no-console
            console.log(`Post the weekly update – ${postTemplate}`)
            break
          }
          case this.configuration.remind_on: {
            // Remind the team to post the weekly update
            this.route = 'remind'
            // eslint-disable-next-line no-console
            console.log('Remind the team to post the weekly update')
            break
          }
        }

        // Mark the action as executed today
        this.executedToday = true
      }
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
      throw error
    }
  }

  // Get the next post_on date
  getPostDate(): string {
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const postOnDay = shortDays.indexOf(`${this.configuration.post_on}`) + 1
    const postOnDate = new Date()
    postOnDate.setDate(
      postOnDate.getDate() + ((postOnDay - postOnDate.getDay() + 7) % 7)
    )
    return postOnDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Read template file
  readTemplateFile(template: string | undefined): string | null {
    if (template) {
      return fs.readFileSync(template, 'utf8')
    }
    return null
  }

  // Check if discussion exists
  async getDiscussionPost(): Promise<number> {
    const query = `
      query {
        repository(owner: "${this.repoOwner}", name: "${this.repoName}") {
          discussions(last: 100) {
            nodes {
              number
              title
            }
          }
        }
      }
    `
    const response: GraphQlQueryResponseData = await this.graphqlWithAuth(query)
    return response.repository.discussions.nodes.find(
      (discussion: {title: string}) =>
        discussion.title === this.configuration.title
    )?.number
  }
}
