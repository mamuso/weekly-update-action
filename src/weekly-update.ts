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
  constructor() {
    this.configuration = {
      set: 'test'
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
