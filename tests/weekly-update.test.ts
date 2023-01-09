import * as process from 'process'
import fs from 'fs'
import path from 'path'
import weeklyUpdate from '../src/weekly-update'
import {getDiscussionPostMock} from './mocks'
import type {GraphQlQueryResponseData} from '@octokit/graphql'
import type {config} from '../src/types'

// Constants
const token: string = process.env.GITHUB_TOKEN

describe('WeeklyUpdate test suite', () => {
  beforeEach(async () => {})

  afterAll(async () => {
    jest.restoreAllMocks()
  })

  it('shoudl fail if no token is provided', async () => {
    const config: config = {
      post_on: 'Mon',
      advance_on: null,
      remind_on: 'Thu',
      repo: 'mamuso/weekly-update-action'
    }
    expect(() => {
      const weeklyUpdateAction = new weeklyUpdate(config)
    }).toThrow('Input required and not supplied: token')
  })

  it('should not run if post_on, advance_on or remind_on are not Today', async () => {
    process.env['INPUT_TOKEN'] = token

    const config: config = {
      post_on: 'Mon',
      advance_on: null,
      remind_on: 'Thu',
      repo: 'mamuso/weekly-update-action'
    }
    const weeklyUpdateAction = new weeklyUpdate(config)
    // intercept Today's date
    weeklyUpdateAction.today = 'Tue'

    await weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Tue')
    expect(weeklyUpdateAction.executedToday).toEqual(false)
  })

  it('should run if post_on, advance_on or remind_on are Today', async () => {
    process.env['INPUT_TOKEN'] = token

    const config: config = {
      post_on: 'Mon',
      remind_on: 'Thu',
      repo: 'mamuso/weekly-update-action'
    }
    const weeklyUpdateAction = new weeklyUpdate(config)
    // intercept Today's date
    weeklyUpdateAction.today = 'Mon'

    await weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Mon')
    expect(weeklyUpdateAction.config.title).not.toContain('{{date}}')
    expect(weeklyUpdateAction.route).toEqual('post')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })

  it('should run advance if post_on, advance_on are equal', async () => {
    process.env['INPUT_TOKEN'] = token

    const config: config = {
      post_on: 'Wed',
      advance_on: 'Wed',
      remind_on: 'Thu',
      repo: 'mamuso/weekly-update-action'
    }
    const weeklyUpdateAction = new weeklyUpdate(config)
    // intercept Today's date
    weeklyUpdateAction.today = 'Wed'

    await weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Wed')
    expect(weeklyUpdateAction.route).toEqual('advance')
    expect(weeklyUpdateAction.config.title).not.toContain('{{date}}')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })

  it('should run remind if remind_on is Today', async () => {
    process.env['INPUT_TOKEN'] = token

    const config: config = {
      post_on: 'Mon',
      remind_on: 'Thu',
      repo: 'mamuso/weekly-update-action'
    }
    const weeklyUpdateAction = new weeklyUpdate(config)
    // intercept Today's date
    weeklyUpdateAction.today = 'Thu'

    await weeklyUpdateAction.run()

    expect(weeklyUpdateAction.today).toEqual('Thu')
    expect(weeklyUpdateAction.route).toEqual('remind')
    expect(weeklyUpdateAction.config.title).not.toContain('{{date}}')
    expect(weeklyUpdateAction.executedToday).toEqual(true)
  })
})
