import React, { useState } from 'react';
import Media from 'react-media';

import MyPositions from 'modules/portfolio/containers/positions';
import MyMarkets from 'modules/portfolio/containers/my-markets';
import OpenOrders from 'modules/portfolio/containers/open-orders';
import FilledOrders from 'modules/portfolio/containers/filled-orders';
import ModuleTabs from 'modules/market/components/common/module-tabs/module-tabs';
import ModulePane from 'modules/market/components/common/module-tabs/module-pane';
import { SMALL_MOBILE, THEMES } from 'modules/common/constants';
import Styles from 'modules/portfolio/components/portfolio-view/portfolio-view.styles.less';
import { PORTFOLIO_VIEW_HEAD_TAGS } from 'modules/seo/helmet-configs';
import { HelmetTag } from 'modules/seo/helmet-tag';
import parseQuery from 'modules/routes/helpers/parse-query';
import { CREATE_MARKET_PORTFOLIO } from 'modules/routes/constants/param-names';
import { getTheme } from 'modules/app/actions/update-app-status';
import { MyBets } from './my-bets';
import { useAppStatusStore } from 'modules/app/store/app-status';

interface PortfolioViewProps {
  location: Location;
}

interface PortfolioViewState {
  extendPositions: boolean;
  extendMarkets: boolean;
  extendOpenOrders: boolean;
  extendFilledOrders: boolean;
  initialPage: number;
}

const PortfolioView = ({ location }: PortfolioViewProps) => {
  const [state, setState] = useState({
    extendPositions: false,
    extendMarkets: false,
    extendOpenOrders: false,
    extendFilledOrders: false,
    initialPage: parseFloat(parseQuery(location.search)[CREATE_MARKET_PORTFOLIO]) || 0,
  });

  const {
    extendPositions,
    extendMarkets,
    extendOpenOrders,
    extendFilledOrders,
    initialPage,
  } = state;

  function toggle(extend: string, hide: string) {
    setState({ ...state, [extend]: !state[extend], [hide]: false });
  };

  const { theme } = useAppStatusStore();

  if (theme === THEMES.SPORTS) {
    return (
      <MyBets />
    );
  }

  return (
    <div className={Styles.PortfolioView}>
        <HelmetTag {...PORTFOLIO_VIEW_HEAD_TAGS} />
        <Media query={SMALL_MOBILE}>
          {matches =>
            matches ? (
              <>
              <ModuleTabs selected={initialPage} fillWidth noBorder>
                <ModulePane label="Positions">
                  <MyPositions />
                </ModulePane>
                <ModulePane label="Open Orders">
                  <OpenOrders />
                </ModulePane>
                <ModulePane label="Filled Orders">
                  <FilledOrders />
                </ModulePane>
                <ModulePane label="My Created Markets">
                  <MyMarkets />
                </ModulePane>
              </ModuleTabs>
              </>
            ) : (
              <section>
                <div>
                  <MyPositions
                    toggle={() =>
                      toggle('extendPositions', 'extendMarkets')
                    }
                    extend={extendPositions}
                    hide={extendMarkets}
                  />
                  <MyMarkets
                    toggle={() =>
                      toggle('extendMarkets', 'extendPositions')
                    }
                    extend={extendMarkets}
                    hide={extendPositions}
                  />
                </div>
                <div>
                  <OpenOrders
                    toggle={() =>
                      toggle('extendOpenOrders', 'extendFilledOrders')
                    }
                    extend={extendOpenOrders}
                    hide={extendFilledOrders}
                  />
                  <FilledOrders
                    toggle={() =>
                      toggle('extendFilledOrders', 'extendOpenOrders')
                    }
                    extend={extendFilledOrders}
                    hide={extendOpenOrders}
                  />
                </div>
              </section>
            )
          }
        </Media>
      </div>
  );
}

export default PortfolioView;