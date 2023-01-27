import {graphql} from '@octokit/graphql'
import type {GraphQlQueryResponseData} from '@octokit/graphql'

export default class GitHub {
  connection: typeof graphql
  constructor(token: string) {
    this.connection = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })
  }

  /**
   * Get repository id
   * @returns {Promise<string>} Repository id
   */
  async getRepoId(repoOwner: string, repoName: string): Promise<string> {
    const query = `
    query {
      repository(owner: "${repoOwner}", name: "${repoName}") {
        id
      }
    }
  `
    const response: GraphQlQueryResponseData = await this.connection(query)
    return response.repository.id
  }

  /**
   * Find discussion by title
   * @returns {Promise<number | null>} Discussion number
   */
  async findDiscussionNumberByTitle(
    repoOwner: string,
    repoName: string,
    title: string | undefined
  ): Promise<number | null> {
    if (title) {
      const query = `
      query {
        repository(owner: "${repoOwner}", name: "${repoName}") {
          discussions(first: 100) {
            nodes {
              id
              number
              title
            }
          }
        }
      }
    `
      const response: GraphQlQueryResponseData = await this.connection(query)
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(response, null, 2))
      return response.repository.discussions.nodes.find((discussion: {title: string}) => discussion.title === title)?.id
    } else {
      return null
    }
  }

  /**
   * Get discussion category id
   * @returns {Promise<number | null>} Category id
   */
  async getDiscussionCategoryId(
    repoOwner: string,
    repoName: string,
    category: string | undefined
  ): Promise<number | null> {
    if (category) {
      const query = `
      query {
        repository(owner: "${repoOwner}", name: "${repoName}") {
          discussionCategories(first: 100) {
            nodes {
              id
              name
            }
          }
        }
      }
    `
      const response: GraphQlQueryResponseData = await this.connection(query)
      return response.repository.discussionCategories.nodes.find(
        (categoryNode: {name: string}) => categoryNode.name === category
      )?.id
    } else {
      return null
    }
  }

  /**
   * Create discussion
   * @returns {Promise<void>}
   */
  async createDiscussion(
    repoOwner: string,
    repoName: string,
    title: string | undefined,
    body: string | undefined,
    categoryId: number | null
  ): Promise<void> {
    if (title && body && categoryId) {
      const repoId = await this.getRepoId(repoOwner, repoName)
      const query = `
      mutation {
        createDiscussion(input: {
            repositoryId: "${repoId}", title: "${title}", body: "${body}", categoryId: "${categoryId}"
          }) {
          discussion {
            number
          }
        }
      }
    `
      await this.connection(query)
    }
  }

  /**
   * Create discussion comment
   * @returns {Promise<void>}
   */
  async createDiscussionComment(discussionId: number | null, body: string | undefined): Promise<void> {
    if (discussionId && body) {
      const query = `
      mutation {
        addDiscussionComment(input: {
            discussionId: "${discussionId}", body: "${body}"
          }) {
          comment {
            id
          }
        }
      }
    `
      await this.connection(query)
    }
  }
}
