const fs = require('fs');
const fetchMasterBranchStats = require('./fetch-master-branch-stats.js').default;
const mergeStats = require('./merge-stats.js').default;
const commentOnPR = require('./comment-on-pr.js').default;

const statsThisBranch = JSON.parse(fs.readFileSync('./public/stats.json', 'utf8'));

fetchMasterBranchStats()
  .then(statsMasterBranch => {
      const { mergedStats, totalStats } = mergeStats({ statsThisBranch, statsMasterBranch });

      let annotation = `
**Artefact filesize changes in this build**

File | Master branch | This branch | Difference
---- | ------------- | ----------- | ----------
`;

      for (const key in mergedStats) {
        const item = mergedStats[key];
        annotation += `\`${key}\` | ${item.masterBranch.toLocaleString()} | ${item.thisBranch.toLocaleString()} | ${item.difference.toLocaleString()} (${item.differencePercentage}%)` + '\n';
      }

      annotation += `**Total** | **${totalStats.masterBranch.toLocaleString()}** | **${totalStats.thisBranch.toLocaleString()}** | **${totalStats.difference.toLocaleString()} (${totalStats.differencePercentage}%)**` + '\n';
      console.log(annotation);

      if (process.env.BUILDKITE_PULL_REQUEST !== 'false') {
        commentOnPR(mergedStats, annotation);
      }
    });
