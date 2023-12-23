/* eslint-disable no-console */

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
   * Get label id
   * @returns {Promise<string | null>} Label id
   */
  async getLabelId(repoOwner: string, repoName: string, label: string | undefined): Promise<string | null> {
    if (label) {
      const query = `
      query {
        repository(owner: "${repoOwner}", name: "${repoName}") {
          labels(first: 100) {
            nodes {
              id
              name
            }
          }
        }
      }
    `
      const response: GraphQlQueryResponseData = await this.connection(query)
      return response.repository.labels.nodes.find((labelNode: {name: string}) => labelNode.name === label)?.id
    } else {
      return null
    }
  }

  /**
   * Get or create label id
   * @returns {Promise<string | null>} Label id
   */

  async getOrCreateLabelId(repoOwner: string, repoName: string, label: string | undefined): Promise<string | null> {
    if (label) {
      const labelId = await this.getLabelId(repoOwner, repoName, label)
      if (labelId) {
        return labelId
      } else {
        const repoId = await this.getRepoId(repoOwner, repoName)
        const query = `
        mutation {
          createLabel(input: {
              repositoryId: "${repoId}", name: "${label}", color: "ededed"
            }) {
            label {
              id
            }
          }
        }
      `
        const response: GraphQlQueryResponseData = await this.connection(query)
        return response.createLabel.label.id
      }
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
    labels: string[] | null,
    categoryId: number | null
  ): Promise<void> {
    if (title && body && categoryId) {
      const repoId = await this.getRepoId(repoOwner, repoName)

      const query = `
      mutation {
        createDiscussion(input: {
            repositoryId: "${repoId}", title: "${title}", body: """${body}""", categoryId: "${categoryId}"
          }) {
          discussion {
            number
          }
        }
      }
    `
      await this.connection(query)

      if (labels) {
        console.log('labels', labels)
        const labelIds = labels
          ? await Promise.all(labels.map(async (label: string) => this.getOrCreateLabelId(repoOwner, repoName, label)))
          : null

        console.log('labelIds', labelIds)

        if (labelIds) {
          const discussionNumber = await this.findDiscussionNumberByTitle(repoOwner, repoName, title)
          if (discussionNumber) {
            const labelsQuery = `
          mutation {
            addLabelsToLabelable(input: {
                labelableId: "${discussionNumber}", labelIds: ${JSON.stringify(labelIds)}
              }) {
              clientMutationId
            }
          }
        `
            await this.connection(labelsQuery)
          }
        }
      }
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
            discussionId: "${discussionId}", body: """${body}"""
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
