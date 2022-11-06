import * as process from 'process'
import fs from 'fs'
import path from 'path'
// import {mockDiscussion, mockDiscussionNotFound} from './mocks'
import weeklyUpdate from '../src/weekly-update'
import {GraphQlQueryResponseData} from '@octokit/graphql'

// Constants
const token: string = 'abcdefg123456'

describe('DiscussionToMarkdown test suite', () => {
  beforeEach(async () => {})

  afterAll(async () => {
    jest.restoreAllMocks()
  })
})
