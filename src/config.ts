import type {config} from '../src/types'

/**
 * Default configuration for the action
 *
 * This will merge with the user's configuration upon instantation of the implementation
 */

export default class defaultConfig {
  config: config
  constructor() {
    this.config = {
      repo: null,
      post_on: 'Mon',
      advance_on: null,
      remind_on: null,
      title: 'Weekly Update ({{date}})',
      post_template: '.github/weekly-post.md',
      remind_template: '.github/weekly-reminder.md',
      category: 'General',
      labels: []
    }
  }
}
