import WeeklyUpdate from './weekly-update'
import * as core from '@actions/core'
import type {config} from './types'

const actionConfig: config = {
  repo: core.getInput('repo'),
  post_on: core.getInput('post_on'),
  advance_on: core.getInput('advance_on'),
  remind_on: core.getInput('remind_on'),
  title: core.getInput('title'),
  post_template: core.getInput('post_template'),
  remind_template: core.getInput('remind_template'),
  category: core.getInput('category')
}
const weekly = new WeeklyUpdate(actionConfig)
weekly.run()
