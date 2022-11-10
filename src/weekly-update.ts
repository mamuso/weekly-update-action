//
//  weekly-update.ts
//
import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import type {GraphQlQueryResponseData} from '@octokit/graphql'
import type {configuration} from './types'

export default class weeklyUpdate {
  configuration: configuration
  today: string
  executedToday: boolean

  // Kick off the action
  constructor(userConfiguration: configuration) {
    this.configuration = {
      post_on: userConfiguration.post_on || 'Mon',
      advance_on: userConfiguration.advance_on || null,
      remind_on: userConfiguration.remind_on || 'Thu'
    }
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
          this.configuration.post_on,
          this.configuration.advance_on,
          this.configuration.remind_on
        ].includes(this.today)
      ) {
        this.executedToday = true
      }
      // eslint-disable-next-line no-console
      console.log(this.configuration)
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
      throw error
    }
  }
}
