require('isomorphic-fetch');

const callGitHub = body => fetch('https://api.github.com/graphql',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
    },
    body: JSON.stringify(body)
  })
  .then(response => {
      if (response.status >= 400) {
        return response.text();
      }
      return response.json();
  });

module.exports.default = (mergedStats, annotation) =>
  callGitHub({
    query: `query($pullRequestNumber: Int!) {
      repository(owner: "keeganstreet", name: "nodejs-docker-example") {
        pullRequest(number: $pullRequestNumber) {
          id
        }
      }
    }`,
    variables: {
      pullRequestNumber: parseFloat(process.env.BUILDKITE_PULL_REQUEST)
    }
  })
  .then(json => {
    let id;
    try {
      id = json.data.repository.pullRequest.id;
    } catch(e) {
      console.log('Could not retrieve Pull Request ID from GitHub');
    }
    return callGitHub({
      query: `mutation($input: AddCommentInput!) {
        addComment(input: $input) {
          subject {
            id
          }
        }
      }`,
      variables: {
        input: {
          body: annotation,
          subjectId: id
        }
      }
    });
  })
  .then(json => {
    console.log(json);
  })
  .catch(error => {
    console.log(error);
  });
