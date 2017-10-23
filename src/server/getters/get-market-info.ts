import BigNumber from "bignumber.js";
import * as Knex from "knex";
import { Address, MarketsRowWithCreationTime, OutcomesRow, UIMarketInfo, UIConsensusInfo, UIOutcomeInfo } from "../../types";

export function reshapeOutcomesRowToUIOutcomeInfo(outcomesRow: OutcomesRow): UIOutcomeInfo {
  const outcomeInfo: UIOutcomeInfo = {
    id: outcomesRow.outcome,
    outstandingShares: outcomesRow.sharesOutstanding,
    price: outcomesRow.price,
  };
  return outcomeInfo;
}

export function reshapeMarketsRowToUIMarketInfo(row: MarketsRowWithCreationTime, outcomesInfo: Array<UIOutcomeInfo>): UIMarketInfo {
  let consensus: UIConsensusInfo|null;
  if (row.consensusOutcome === null) {
    consensus = null;
  } else {
    consensus = { outcomeID: row.consensusOutcome, isIndeterminate: row.isInvalid } as UIConsensusInfo;
  }
  const marketInfo: UIMarketInfo = {
    id: row.marketID,
    universe: row.universe,
    type: row.marketType,
    numOutcomes: row.numOutcomes,
    minPrice: row.minPrice,
    maxPrice: row.maxPrice,
    cumulativeScale: new BigNumber(row.maxPrice, 10).minus(new BigNumber(row.minPrice, 10)).toFixed(),
    author: row.marketCreator,
    creationTime: row.creationTime,
    creationBlock: row.creationBlockNumber,
    creationFee: row.creationFee,
    reportingFeeRate: row.reportingFeeRate,
    marketCreatorFeeRate: row.marketCreatorFeeRate,
    marketCreatorFeesCollected: row.marketCreatorFeesCollected,
    category: row.category,
    tags: [row.tag1, row.tag2],
    volume: row.volume,
    outstandingShares: row.sharesOutstanding,
    reportingWindow: row.reportingWindow,
    endDate: row.endTime,
    finalizationTime: row.finalizationTime,
    phase: row.phase,
    description: row.shortDescription,
    extraInfo: row.longDescription,
    designatedReporter: row.designatedReporter,
    designatedReportStake: row.designatedReportStake,
    resolutionSource: row.resolutionSource,
    numTicks: row.numTicks,
    consensus,
    outcomes: outcomesInfo,
  };
  return marketInfo;
}

export function getMarketInfo(db: Knex, marketID: string, callback: (err: Error|null, result?: UIMarketInfo) => void): void {
  db.select(["markets.*", "blocks.timestamp as creationTime"]).from("markets").leftJoin("blocks", "markets.creationBlockNumber", "blocks.blockNumber").where("markets.marketID", marketID).limit(1).asCallback((err: Error|null, rows?: Array<MarketsRowWithCreationTime>): void => {
    if (err) return callback(err);
    if (!rows || !rows.length) return callback(null);
    const marketsRow: MarketsRowWithCreationTime = rows[0];
    db("outcomes").where({ marketID }).asCallback((err: Error|null, outcomesRows?: Array<OutcomesRow>): void => {
      if (err) return callback(err);
      const outcomesInfo: Array<UIOutcomeInfo> = outcomesRows!.map((outcomesRow: OutcomesRow): UIOutcomeInfo => reshapeOutcomesRowToUIOutcomeInfo(outcomesRow));
      callback(null, reshapeMarketsRowToUIMarketInfo(marketsRow, outcomesInfo));
    });
  });
}
