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

  it('should not run if post_on, advance_on or remind_on are not Today', async () => {
    const configuration: configuration = {
      post_on: 'Mon',
      advance_on: null,
      remind_on: 'Thu'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Tue'

    weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Tue')
    expect(weeklyUpdateAction.executedToday).toEqual(false)
  })

  it('should run if post_on, advance_on or remind_on are are Today', async () => {
    const configuration: configuration = {
      post_on: 'Mon',
      advance_on: null,
      remind_on: 'Thu'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Mon'

    weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Mon')
    expect(weeklyUpdateAction.route).toEqual('post')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })

  it('should run advance if post_on, advance_on are equal', async () => {
    const configuration: configuration = {
      post_on: 'Wed',
      advance_on: 'Wed',
      remind_on: 'Thu'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Wed'

    weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Wed')
    expect(weeklyUpdateAction.route).toEqual('advance')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })

  it('should run remind if remind_on is Today', async () => {
    const configuration: configuration = {
      post_on: 'Tue',
      advance_on: 'Tue',
      remind_on: 'Thu'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Thu'

    weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Thu')
    expect(weeklyUpdateAction.route).toEqual('remind')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })
})
