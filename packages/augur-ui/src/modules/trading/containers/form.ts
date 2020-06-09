import { connect } from 'react-redux';
import Form from 'modules/trading/components/form';
import { selectSortedMarketOutcomes } from 'modules/markets/selectors/market';
import { formatOrderBook } from 'modules/create-market/helpers/format-order-book';
import { AppState } from 'appStore';
import { totalTradingBalance } from 'modules/auth/helpers/login-account';
import { formatGasCost } from 'utils/format-number';
import { createBigNumber } from 'utils/create-big-number';
import { GWEI_CONVERSION } from 'modules/common/constants';
import { augurSdk } from 'services/augursdk';
import { AppStatus } from 'modules/app/store/app-status';

const mapStateToProps = (state: AppState, ownProps) => {
  const getGasConfirmEstimate = async () => {
    const augur = augurSdk.get();
    const gasConfirmTime = await augur.getGasConfirmEstimate();
    return gasConfirmTime;
  };
  const {
    gasPriceInfo,
    blockchain: { currentAugurTimestamp: currentTimestamp },
  } = AppStatus.get();
  const gasPriceInWei = formatGasCost(
    createBigNumber(gasPriceInfo.userDefinedGasPrice || 0).times(
      createBigNumber(GWEI_CONVERSION)
    ),
    {}
  ).value;

  const selectedOutcomeId =
    ownProps.selectedOutcome !== undefined && ownProps.selectedOutcome !== null
      ? ownProps.selectedOutcome.id
      : ownProps.market.defaultSelectedOutcomeId;

  let outcomeOrderBook = {};
  if (ownProps.initialLiquidity) {
    outcomeOrderBook = formatOrderBook(
      ownProps.market.orderBook[selectedOutcomeId]
    );
  }
  const {
    maxPriceBigNumber: maxPrice,
    minPriceBigNumber: minPrice,
  } = ownProps.market;
  const {
    selectedNav,
    orderPrice,
    orderQuantity,
    orderDaiEstimate,
    orderEscrowdDai,
    doNotCreateOrders,
    expirationDate,
  } = ownProps.orderState;
  return {
    selectedNav,
    orderPrice,
    orderQuantity,
    orderDaiEstimate,
    orderEscrowdDai,
    doNotCreateOrders,
    expirationDate,
    maxPrice,
    minPrice,
    availableDai: totalTradingBalance(),
    currentTimestamp,
    sortedOutcomes: selectSortedMarketOutcomes(
      ownProps.market.marketType,
      ownProps.market.outcomesFormatted
    ),
    endTime: ownProps.market.endTime || ownProps.market.setEndTime,
    gasPrice: gasPriceInWei,
    orderBook: outcomeOrderBook,
    getGasConfirmEstimate,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

const FormContainer = connect(mapStateToProps, mapDispatchToProps)(Form);

export default FormContainer;
