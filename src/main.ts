import weeklyUpdate from './weekly-update'
import * as core from '@actions/core'
import type {configuration} from './types'

const actionConfiguration: configuration = {
  post_on: core.getInput('post_on'),
  advance_on: core.getInput('advance_on'),
  remind_on: core.getInput('remind_on'),
  title: core.getInput('title'),
  post_template: core.getInput('post_template'),
  remind_template: core.getInput('remind_template'),
  repo: core.getInput('repo')
}
const weekly = new weeklyUpdate(actionConfiguration)
weekly.run()
