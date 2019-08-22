const calculateDifference = (thisBranch, masterBranch) => {
  const difference = thisBranch - masterBranch;
  const differencePercentage = (masterBranch === 0) ? 100 : Math.round(difference / masterBranch * 100 * 100) / 100;
  return {
    difference,
    differencePercentage
  }
};

module.exports.default = ({ statsThisBranch, statsMasterBranch }) => {
  const mergedStats = {};
  for (const key in statsThisBranch) {
    mergedStats[key] = {
      thisBranch: statsThisBranch[key],
      masterBranch: 0
    };
  }

  const totalStats = {
    thisBranch: 0,
    masterBranch: 0
  };

  for (const key in statsMasterBranch) {
    if (!mergedStats[key]) {
      mergedStats[key] = {
        thisBranch: 0
      };
    }
    mergedStats[key].masterBranch = statsMasterBranch[key];
  }

  for (const key in mergedStats) {
    const item = mergedStats[key];
    totalStats.thisBranch += item.thisBranch;
    totalStats.masterBranch += item.masterBranch;
    const { difference, differencePercentage } = calculateDifference(item.thisBranch, item.masterBranch);
    item.difference = difference;
    item.differencePercentage = differencePercentage;
  }

  const { difference, differencePercentage } = calculateDifference(totalStats.thisBranch, totalStats.masterBranch);
  totalStats.difference = difference;
  totalStats.differencePercentage = differencePercentage;

  return {
    mergedStats,
    totalStats
  };
};