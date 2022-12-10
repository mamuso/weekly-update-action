import * as process from 'process'
import fs from 'fs'
import path from 'path'
// import {mockDiscussion, mockDiscussionNotFound} from './mocks'
import weeklyUpdate from '../src/weekly-update'
import {getDiscussionPostMock} from './mocks'
import type {GraphQlQueryResponseData} from '@octokit/graphql'
import type {configuration} from '../src/types'

// Constants
const token: string = process.env.PAT || '123456'
console.log(token)

describe('WeeklyUpdate test suite', () => {
  beforeEach(async () => {})

  afterAll(async () => {
    jest.restoreAllMocks()
  })

  it('shoudl fail if no token is provided', async () => {
    const configuration: configuration = {
      post_on: 'Mon',
      advance_on: null,
      remind_on: 'Thu'
    }
    expect(() => {
      const weeklyUpdateAction = new weeklyUpdate(configuration)
    }).toThrow('Input required and not supplied: token')
  })

  it('should not run if post_on, advance_on or remind_on are not Today', async () => {
    process.env['INPUT_TOKEN'] = token

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

  it('should run if post_on, advance_on or remind_on are Today', async () => {
    process.env['INPUT_TOKEN'] = token

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
    expect(weeklyUpdateAction.configuration.title).not.toContain('{{date}}')
    expect(weeklyUpdateAction.route).toEqual('post')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })

  it('should run advance if post_on, advance_on are equal', async () => {
    process.env['INPUT_TOKEN'] = token

    const configuration: configuration = {
      post_on: 'Wed',
      advance_on: 'Wed',
      remind_on: 'Thu',
      repo: 'mamuso/weekly-update-action'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Wed'

    await weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Wed')
    expect(weeklyUpdateAction.route).toEqual('advance')
    expect(weeklyUpdateAction.configuration.title).not.toContain('{{date}}')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })

  it('should run remind if remind_on is Today', async () => {
    process.env['INPUT_TOKEN'] = token

    const configuration: configuration = {
      post_on: 'Tue',
      advance_on: 'Tue',
      remind_on: 'Thu'
    }
    const weeklyUpdateAction = new weeklyUpdate(configuration)
    // intercept Today's date
    weeklyUpdateAction.today = 'Thu'

    await weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Thu')
    expect(weeklyUpdateAction.route).toEqual('remind')
    expect(weeklyUpdateAction.configuration.title).not.toContain('{{date}}')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })
})
