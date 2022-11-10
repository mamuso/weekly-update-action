//
//  weekly-update.ts
//
import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import type {GraphQlQueryResponseData} from '@octokit/graphql'
import type {configuration} from './types'

export default class weeklyUpdate {
  configuration: configuration
  route: string
  today: string
  executedToday: boolean

  // Kick off the action
  constructor(userConfiguration: configuration) {
    this.configuration = {
      post_on: userConfiguration.post_on || 'Mon',
      advance_on: userConfiguration.advance_on || null,
      remind_on: userConfiguration.remind_on || 'Thu'
    }
    this.route = ''
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'short'
    })
    this.executedToday = false
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
        // eslint-disable-next-line no-console
        console.log(this.today)

        switch (this.today) {
          case this.configuration.advance_on:
            // Advance the week
            this.route = 'advance'
            // eslint-disable-next-line no-console
            console.log('Advance the week')
            break
          case this.configuration.post_on:
            // Post the weekly update
            this.route = 'post'
            // eslint-disable-next-line no-console
            console.log('Post the weekly update')
            break
          case this.configuration.remind_on:
            // Remind the team to post the weekly update
            this.route = 'remind'
            // eslint-disable-next-line no-console
            console.log('Remind the team to post the weekly update')
            break
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
}
