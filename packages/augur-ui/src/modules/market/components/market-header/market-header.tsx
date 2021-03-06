import React, { Component, useState, useEffect } from 'react';
import classNames from 'classnames';
import {
  ChevronDown,
  ChevronUp,
  TwoArrowsOutline,
  LeftChevron,
} from 'modules/common/icons';
import MarkdownRenderer from 'modules/common/markdown-renderer';
import { MarketHeaderBar } from 'modules/market/components/market-header/market-header-bar';
import { BigNumber } from 'bignumber.js';
import Styles from 'modules/market/components/market-header/market-header.styles.less';
import CoreProperties from 'modules/market/components/core-properties/core-properties';
import {
  SCALAR,
  PROBABLE_INVALID_MARKET,
  HEADER_TYPE,
  REPORTING_STATE,
  ZERO,
} from 'modules/common/constants';
import { MarketHeaderReporting } from 'modules/market/components/market-header/market-header-reporting';
import ToggleHeightStyles from 'utils/toggle-height.styles.less';
import { MarketData, TextObject } from 'modules/types';
import { TutorialPopUp } from 'modules/market/components/common/tutorial-pop-up';
import MarketTitle from 'modules/market/components/common/market-title';
import PreviewMarketTitle from 'modules/market/components/common/PreviewMarketTitle';
import { HeadingBar } from '../common/common';
import { selectMarket } from 'modules/markets/selectors/market';
import { useAppStatusStore } from 'modules/app/store/app-status';
import { isSameAddress } from 'utils/isSameAddress';
import { useRef } from 'react';
import { useHistory } from 'react-router';

const OVERFLOW_DETAILS_LENGTH = 48; // in px, overflow limit to trigger MORE details

interface MarketHeaderProps {
  market: MarketData;
  preview?: boolean;
  reportingBarShowing: boolean;
  next: Function;
  showTutorialData?: boolean;
  text: TextObject;
  step: number;
  totalSteps: number;
  showTutorialDetails?: boolean;
  marketId: string;
}

export const MarketHeader = ({
  market,
  marketId,
  showTutorialDetails,
  preview,
  showTutorialData,
  totalSteps,
  text,
  next,
  step,
}: MarketHeaderProps) => {
  const detailsContainer = useRef({
    current: { clientHeight: 0, scrollHeight: 0, scrollTop: 0 },
  });
  const refTitle = useRef(null);
  const refNotCollapsed = useRef(null);

  const history = useHistory();

  const marketSelected = market || selectMarket(marketId);
  let reportingBarShowing = false;
  const {
    loginAccount: { address: userAccount },
    universe: { forkingInfo },
    blockchain: { currentAugurTimestamp },
  } = useAppStatusStore();

  const {
    marketType,
    scalarDenomination,
    reportingState,
    disputeInfo,
    endTimeFormatted,
    maxPriceBigNumber,
    minPriceBigNumber,
    detailsText,
    designatedReporter,
    id,
    consensusFormatted: consensus,
    mostLikelyInvalid,
  } = marketSelected;

  if (
    consensus ||
    reportingState === REPORTING_STATE.CROWDSOURCING_DISPUTE ||
    reportingState === REPORTING_STATE.OPEN_REPORTING ||
    (reportingState === REPORTING_STATE.DESIGNATED_REPORTING &&
      isSameAddress(designatedReporter, userAccount))
  ) {
    reportingBarShowing = true;
  }

  const description = marketSelected.description || '';
  let details = marketSelected.details || detailsText || '';
  const maxPrice = maxPriceBigNumber || ZERO;
  const minPrice = minPriceBigNumber || ZERO;

  const [showProperties, setShowProperties] = useState(
    reportingState === REPORTING_STATE.PRE_REPORTING ? false : true
  );
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [clickHandler, setClickHandler] = useState(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);

  useEffect(() => {
    if (showCopied) setTimeout(() => setShowCopied(false), 4000);
  }, [showCopied]);

  useEffect(() => {
    if (detailsContainer) {
      setDetailsHeight(detailsContainer.current.scrollHeight);
    }

    const clickHandlerFnc = e => {
      const ClickedOnExpandedContent =
        e &&
        e
          .composedPath()
          .find(
            ({ className }) =>
              className === 'string' &&
              className.includes('market-header-styles_ExpandedContent')
          );
      if (!ClickedOnExpandedContent && detailsContainer.current)
        setShowReadMore(false);
    };
    setClickHandler(clickHandlerFnc);
    window.addEventListener('click', clickHandlerFnc);

    return () => {
      window.removeEventListener('click', clickHandler);
    };
  }, []);

  const detailsTooLong =
    marketSelected.details && detailsHeight > OVERFLOW_DETAILS_LENGTH;
  const isScalar = marketType === SCALAR;
  if (isScalar) {
    const denomination = scalarDenomination ? ` ${scalarDenomination}` : '';
    const warningText =
      (details.length > 0 ? `\n\n` : ``) +
      `If the real-world outcome for this market is above this market's maximum value, the maximum value (${maxPrice.toString()}${denomination}) should be reported. If the real-world outcome for this market is below this market's minimum value, the minimum value (${minPrice.toString()}${denomination}) should be reported.`;
    details += warningText;
  }

  const bigTitle = refTitle?.firstChild?.scrollHeight > 64;
  const expandedDetails = detailsTooLong && showReadMore;

  return (
    <section
      className={classNames(
        Styles.MarketHeader,
        ToggleHeightStyles.target,
        ToggleHeightStyles.open,
        ToggleHeightStyles.quick,
        {
          [Styles.Collapsed]: headerCollapsed,
          [ToggleHeightStyles.open]: !headerCollapsed,
        }
      )}
    >
      {!headerCollapsed && (
        <div ref={refNotCollapsed}>
          <div
            className={classNames({
              [Styles.ShowTutorial]: showTutorialDetails,
            })}
          >
            <HeadingBar
              market={marketSelected}
              expandedDetails={expandedDetails}
              showCopied={showCopied}
              setShowCopied={() => setShowCopied(true)}
            />
            <div
              ref={refTitle}
              className={classNames(Styles.MarketDetails, {
                [Styles.BigTitle]: bigTitle,
                [Styles.ExpandedContent]: expandedDetails,
              })}
            >
              {preview ? (
                <PreviewMarketTitle market={marketSelected} />
              ) : (
                <MarketTitle id={id} noLink headerType={HEADER_TYPE.H1} />
              )}
              {mostLikelyInvalid ? (
                <div className={Styles.ResolvingInvalid}>
                  <span>{PROBABLE_INVALID_MARKET}</span>
                </div>
              ) : null}
              {details.length > 0 && (
                <div className={Styles.Details}>
                  <h2>Resolution Details</h2>
                  <div>
                    <label
                      ref={detailsContainer}
                      className={classNames(Styles.AdditionalDetails, {
                        [Styles.Tall]: expandedDetails,
                      })}
                    >
                      <MarkdownRenderer text={details} hideLabel />
                    </label>
                    {detailsTooLong && (
                      <button
                        className={classNames({
                          [Styles.Less]: showReadMore,
                        })}
                        onClick={e => {
                          e.stopPropagation();
                          setShowReadMore(!showReadMore);
                        }}
                      >
                        {!showReadMore ? ChevronDown : ChevronUp}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            className={classNames({
              [Styles.ShowTutorial]: showTutorialData,
            })}
          >
            <div
              className={classNames(Styles.Properties, {
                [Styles.HideProperties]: !showProperties,
              })}
            >
              {(id || preview) && (
                <MarketHeaderBar
                  market={marketSelected}
                  reportingState={reportingState}
                  disputeInfo={disputeInfo}
                  endTimeFormatted={endTimeFormatted}
                />
              )}
              <MarketHeaderReporting
                marketId={id}
                preview={preview}
                market={preview && marketSelected}
              />
              {(id || preview) && (
                <CoreProperties
                  market={marketSelected}
                  reportingBarShowing={reportingBarShowing}
                  showExtraDetailsChevron={showProperties}
                />
              )}
              {reportingState === REPORTING_STATE.PRE_REPORTING && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowProperties(!showProperties);
                  }}
                >
                  {!showProperties ? ChevronDown : ChevronUp}
                </button>
              )}
            </div>
            {showTutorialData && (
              <TutorialPopUp
                top
                step={step}
                totalSteps={totalSteps}
                text={text}
                next={next}
              />
            )}
          </div>
        </div>
      )}
      <div
        className={classNames(Styles.Toggle, {
          [Styles.CollapsedToggle]: headerCollapsed,
        })}
      >
        {headerCollapsed && (
          <button
            className={Styles.BackButton}
            onClick={() => history.goBack()}
          >
            {LeftChevron} <span>Back</span>
          </button>
        )}
        <button onClick={() => setHeaderCollapsed(!headerCollapsed)}>
          {headerCollapsed && (
            <>
              <h1>{description}</h1>
              <MarketHeaderBar
                market={marketSelected}
                reportingState={reportingState}
                disputeInfo={disputeInfo}
                endTimeFormatted={endTimeFormatted}
              />
            </>
          )}
          {TwoArrowsOutline}
        </button>
      </div>
    </section>
  );
};
