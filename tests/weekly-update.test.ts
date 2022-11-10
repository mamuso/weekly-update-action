import * as process from 'process'
import fs from 'fs'
import path from 'path'
// import {mockDiscussion, mockDiscussionNotFound} from './mocks'
import weeklyUpdate from '../src/weekly-update'
import {GraphQlQueryResponseData} from '@octokit/graphql'
import type {configuration} from '../src/types'

// Constants
const token: string = 'abcdefg123456'

describe('WeeklyUpdate test suite', () => {
  beforeEach(async () => {})

  afterAll(async () => {
    jest.restoreAllMocks()
  })

  it('should run the action if post_on, advance_on or remind_on are not null', async () => {
    const configuration: configuration = {
      post_on: 'Mon',
      advance_on: null,
      remind_on: 'Thu'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Mon'

    weeklyUpdateAction.run()

    expect(weeklyUpdateAction.configuration).toEqual(configuration)
    expect(weeklyUpdateAction.today).toEqual('Mon')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })
})
