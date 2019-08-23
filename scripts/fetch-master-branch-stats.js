require('isomorphic-fetch');

const query = `{
  pipeline(slug: "keegan-street/keegan-buildkite-play") {
    builds(branch: "master", state: PASSED, first: 1) {
      edges {
        node {
          commit
          message
          url
          metaData {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
}`;

module.exports.default = () => fetch('https://graphql.buildkite.com/v1',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TOKEN}`
    },
    body: JSON.stringify({
      query,
      variables: {}
    })
  })
  .then(response => {
    if (response.status >= 400) {
      throw Error(response.statusText);
    }
    return response.json();
  })
  .then(json => {
    try {
      return JSON.parse(json.data.pipeline.builds.edges[0].node.metaData.edges.find(edge => edge.node.key === 'bundle-stats').node.value);
    } catch(e) {
      console.log('Could not retrieve metadata for master branch bundle size');
    }
  });
