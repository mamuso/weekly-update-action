import type {GraphQlQueryResponseData} from '@octokit/graphql'

export const getDiscussionPostMock: GraphQlQueryResponseData = {
  repository: {
    id: 'R_kgDOIR9Usw',
    discussions: {
      nodes: [
        {number: 2, title: 'Weekly Update (November 16, 2022)'},
        {number: 1, title: 'Test Discussion'}
      ]
    }
  }
}
