//
//  weekly-update.ts
//
import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import type {GraphQlQueryResponseData} from '@octokit/graphql'
import type {configuration} from './types'

export default class weeklyUpdate {
  configuration: configuration

  // Kick off the action
  constructor(userConfiguration: configuration) {
    this.configuration = {
      set: userConfiguration.set || 'Mon'
    }
  }

  // Trigger the action
  async run(): Promise<void> {
    try {
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
