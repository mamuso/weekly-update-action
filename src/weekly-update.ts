import * as core from '@actions/core'
import * as fs from 'fs'
import GitHub from './github'
import DefaultConfig from './config'
import type {config} from './types'

export default class WeeklyUpdate {
  config: config
  token: string
  route: string
  today: string
  executedToday: boolean
  repoOwner: string
  repoName: string
  postTemplate: string | undefined
  remindTitle: string | undefined
  remindTemplate: string | undefined
  github: GitHub

  constructor(actionConfig: config) {
    /**
     * Merge the default configuration with the user's configuration
     */
    this.config = new DefaultConfig().config
    Object.assign(this.config, actionConfig)

    this.token = core.getInput('token', {required: true})
    this.github = new GitHub(this.token)

    this.route = '' // post, advance, remind

    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'short'
    })
    this.executedToday = false

    if (this.config.repo != null) {
      const repo = this.config.repo.split('/')
      this.repoOwner = repo[0]
      this.repoName = repo[1]
    } else {
      throw new Error('Repository not specified')
    }
  }

  async run(): Promise<void> {
    try {
      const shouldRunToday = [this.config.advance_on, this.config.post_on, this.config.remind_on].includes(this.today)
      if (shouldRunToday) {
        const postOnDateStr = this.getPostDate()
        const previousPostOnDateStr = this.getPostDate(-7)

        /**
         * Process the title and templates
         */
        this.remindTitle = this.config.title?.replace('{{date}}', previousPostOnDateStr)
        this.config.title = this.config.title?.replace('{{date}}', postOnDateStr)
        this.postTemplate = this.readTemplateFile(this.config.post_template)?.replace('{{date}}', postOnDateStr)
        this.remindTemplate = this.readTemplateFile(this.config.remind_template)?.replace(
          '{{date}}',
          previousPostOnDateStr
        )

        /**
         * Determine the route that the action needs to take based on the day of the week and the configuration. The route will be one of the following:
         * - post: Post the weekly update
         * - advance: Advance the week
         * - remind: Remind the team to post the weekly update
         */
        switch (this.today) {
          /**
           * Post the weekly update discussion ahead of the post_on date
           */
          case this.config.advance_on: {
            this.route = 'advance'
            await this.postDiscussion()
            break
          }
          /**
           * Post the weekly update on the post_on date if it doesn't already exist
           */
          case this.config.post_on: {
            this.route = 'post'
            await this.postDiscussion()
            break
          }
          /**
           * Post a reminder as a reply to the weekly update on the remind_on date
           */
          case this.config.remind_on: {
            this.route = 'remind'
            await this.postReminder()
            break
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
      throw error
    }
  }

  async postDiscussion(): Promise<void> {
    const discussionId: number | null = await this.getDiscussionId()
    if (!discussionId) {
      const categoryId: number | null = await this.getCategoryId()
      if (categoryId) {
        await this.github.createDiscussion(
          this.repoOwner,
          this.repoName,
          this.config.title,
          this.postTemplate,
          categoryId
        )
      } else {
        throw new Error(`Category ${this.config.category} not found`)
      }
    }
    this.executedToday = true
  }

  async postReminder(): Promise<void> {
    const discussionId: number | null = await this.getDiscussionId(this.remindTitle)
    if (discussionId) {
      await this.github.createDiscussionComment(discussionId, this.remindTemplate)
    }
    this.executedToday = true
  }

  async getDiscussionId(title = this.config.title): Promise<number | null> {
    const discussionId: number | null = await this.github.findDiscussionNumberByTitle(
      this.repoOwner,
      this.repoName,
      title
    )
    return discussionId
  }

  async getCategoryId(): Promise<number | null> {
    const categoryId: number | null = await this.github.getDiscussionCategoryId(
      this.repoOwner,
      this.repoName,
      this.config.category
    )
    return categoryId
  }

  /**
   *
   * @returns {string} The date of the next post_on date
   */
  getPostDate(offset = 0): string {
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const postOnDay = shortDays.indexOf(`${this.config.post_on}`) + 1
    const postOnDate = new Date()
    postOnDate.setDate(postOnDate.getDate() + ((postOnDay - postOnDate.getDay() + 7) % 7) + offset)
    return postOnDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   *
   * @param {string | undefined} template The path to the template file
   * @returns {string | null} The contents of the template file
   */
  readTemplateFile(template: string | undefined): string | null {
    if (template) {
      return fs.readFileSync(template, 'utf8')
    }
    return null
  }
}
