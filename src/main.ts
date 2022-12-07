import weeklyUpdate from './weekly-update'
import type {configuration} from './types'

const actionConfiguration: configuration = {
  post_on: process.env.post_on,
  advance_on: process.env.advance_on,
  remind_on: process.env.remind_on,
  title: process.env.title,
  post_template: process.env.post_template,
  remind_template: process.env.remind_template,
  repo: process.env.repo
}
const weekly = new weeklyUpdate(actionConfiguration)
weekly.run()
