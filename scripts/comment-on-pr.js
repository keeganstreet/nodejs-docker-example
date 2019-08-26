require("isomorphic-fetch");

const callGitHub = body =>
  fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    },
    body: JSON.stringify(body)
  }).then(response => {
    if (response.status >= 400) {
      throw Error(response.statusText);
    }
    return response.json();
  });

const loadPRData = () =>
  callGitHub({
    query: `query($pullRequestNumber: Int!) {
    repository(owner: "keeganstreet", name: "nodejs-docker-example") {
      pullRequest(number: $pullRequestNumber) {
        id
        comments(first: 10) {
          nodes {
            body,
            id,
            viewerDidAuthor
          }
        }
      }
    }
  }`,
    variables: {
      pullRequestNumber: parseFloat(process.env.BUILDKITE_PULL_REQUEST)
    }
  });

const postNewComment = (comment, pullRequestId) =>
  callGitHub({
    query: `mutation($input: AddCommentInput!) {
    addComment(input: $input) {
      commentEdge {
        node {
          id
        }
      }
    }
  }`,
    variables: {
      input: {
        body: comment,
        subjectId: pullRequestId
      }
    }
  });

const updateExistingComment = (comment, existingCommentId) =>
  callGitHub({
    query: `mutation($input: UpdateIssueCommentInput!) {
    updateIssueComment(input: $input) {
      issueComment {
        id
      }
    }
  }`,
    variables: {
      input: {
        body: comment,
        id: existingCommentId
      }
    }
  });

module.exports.default = (annotation) =>
  loadPRData()
    .then(json => {
      let pullRequestId;
      let existingCommentId;
      try {
        pullRequestId = json.data.repository.pullRequest.id;
        const existingComment = json.data.repository.pullRequest.comments.nodes.find(
          item =>
            item.viewerDidAuthor &&
            /Artefact filesize changes in this build/.test(item.body)
        );
        if (existingComment) {
          existingCommentId = existingComment.id;
        }
      } catch (e) {
        console.log("Could not retrieve Pull Request data from GitHub");
      }

      const comment = `_Automated comment:_ ${annotation}`
      if (existingCommentId) {
        return updateExistingComment(comment, existingCommentId);
      } else {
        return postNewComment(comment, pullRequestId);
      }
    })
    .then(json => {
      console.log(JSON.stringify(json));
    })
    .catch(error => {
      console.log(error);
    });
