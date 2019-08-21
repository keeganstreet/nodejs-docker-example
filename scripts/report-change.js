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

fetch('https://graphql.buildkite.com/v1',
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
          throw new Error('Bad response from server');
      }
      return response.json();
  })
  .then(json => {
      console.log(JSON.stringify(json));
  });
