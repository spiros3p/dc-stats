import "./styles.scss";
import flowSDM from "./media/flowSDM.png";
import waxSDM from "./media/waxSDM.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { mainFlowFetch } from "./flow/flowFetchPool";

const jsonserverURL = "https://dc-api.speppas.online/dc-stats";

const totalLandNFTs = {
  common: 3140,
  rare: 600,
  epic: 200,
  legendary: 50,
  mythic: 10,
  total: 4000,
};

const totalPacks = {
  waxLands: 2700,
  flowLands: 2500,
  flowBonus: 0,
};

const initialSDMPrice = {
  waxSDM: 0.0132, //wax
  flowSDM: 0.001, //usd
  usdWAX: 0.08842, // 16/6/22
};

let bugs;
let openedPacks;
let landsInPacks;
let landsInGame;
let lastUpdated;
let generalInfo;
let tokensPrice = {}; //soon
let packSales = [];

// display sections
const displayBugs = false;

export default function App() {
  const [fetched, setFetched] = useState(false);
  const [bugsState, setBugsState] = useState(bugs);
  const [openedPacksState, setOpenedPacksState] = useState(openedPacks);
  const [landsInPacksState, setLandsInPacksState] = useState(landsInPacks);
  const [landsInGameState, setLandsInGameState] = useState(landsInGame);
  const [lastUpdatedState, setLastUpdatedState] = useState(lastUpdated);
  const [generalInfoState, setGeneralInfoState] = useState(generalInfo);
  const [tokensPriceState, setTokensPriceState] = useState(tokensPrice);
  const [packSalesState, setPackSalesState] = useState([]);

  useEffect(() => {
    fetchEverything();
  }, []);

  useEffect(() => {
    // console.log("RUN");
    setBugsState(bugs);
    setOpenedPacksState(openedPacks);
    setLandsInPacksState(landsInPacks);
    setLandsInGameState(landsInGame);
    setLastUpdatedState(lastUpdated);
    setGeneralInfoState(generalInfo);
    setTokensPriceState(tokensPrice);
    setPackSalesState(packSales);
  }, [fetched]);

  const fetchEverything = async () => {
    try {
      const response = await axios.all([
        axios.get(`${jsonserverURL}/bugs`),
        axios.get(`${jsonserverURL}/openedPacks`),
        axios.get(`${jsonserverURL}/landsInPacks`),
        axios.get(`${jsonserverURL}/landsInGame`),
        axios.get(`${jsonserverURL}/lastUpdated`),
        axios.get(`${jsonserverURL}/generalInfo`),
        axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=wax&vs_currencies=usd"
        ),
        axios.get("https://wax.alcor.exchange/api/markets/542"),
        axios.get(`${jsonserverURL}/pack-sales`),
      ]);
      packSales = response[8].data.packs;
      bugs = response[0].data;
      openedPacks = response[1].data;
      landsInPacks = response[2].data;
      landsInGame = response[3].data;
      lastUpdated = response[4].data;
      generalInfo = response[5].data;
      landsInGame["waxTotalCurrent"] =
        landsInGame.wax.common.total +
        landsInGame.wax.rare.total +
        landsInGame.wax.epic.total +
        landsInGame.wax.legendary.total +
        landsInGame.wax.mythic.total;
      landsInGame["flowTotalCurrent"] =
        landsInGame.flow.common.total +
        landsInGame.flow.rare.total +
        landsInGame.flow.epic.total +
        landsInGame.flow.legendary.total +
        landsInGame.flow.mythic.total;
      tokensPrice["usdWAX"] = response[6].data.wax.usd;
      tokensPrice["waxSDM"] = response[7].data.last_price;
      tokensPrice["sdmUsdChange"] = calculateChangeInPrice(
        initialSDMPrice.usdWAX * initialSDMPrice.waxSDM,
        tokensPrice["usdWAX"] * tokensPrice["waxSDM"]
      );
      tokensPrice["sdmWaxChange"] = calculateChangeInPrice(
        initialSDMPrice.waxSDM,
        tokensPrice["waxSDM"]
      );
      tokensPrice["flowSDM"] = await mainFlowFetch();
      tokensPrice["sdmFlowchange"] = calculateChangeInPrice(
        initialSDMPrice.flowSDM,
        tokensPrice["flowSDM"]
      );
      setFetched(true);
    } catch (e) {
      if (e.response) {
        console.error(e.response.data);
      } else {
        console.error(e);
      }
    }
  };

  const calculateChangeInPrice = (initial, current) => {
    let percentage = 0;
    let mutliplier = 0;
    if (current > initial) {
      percentage = (current / initial - 1) * 100;
      // mutliplier = current / initial;
    } else if (current < initial) {
      percentage = (current / initial - 1) * 100;
      // mutliplier = 0 //to discuss
    }
    return percentage;
  };

  const calculateLastDeployment = (timestamp) => {
    let today = new Date();
    let difference = today - timestamp;
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  };

  // RENDER land NFTs (WAX & FLOW) in packs and in game
  const renderLandTablePerBlockchain = (lands, title) => {
    return (
      <tbody>
        <tr>
          <th scope="row">Common</th>
          <td>
            {lands?.common?.current}
            <span className="smaller">
              /{lands?.common?.total || totalLandNFTs.common}
              {title === "Land NFTs Staked in Game *" && (
                <span className="smaller" style={{ color: "red" }}>
                  ({`-${lands?.common?.total - lands?.common?.current}`})
                </span>
              )}
            </span>
          </td>
        </tr>
        <tr>
          <th scope="row">Rare</th>
          <td>
            {lands?.rare?.current}
            <span className="smaller">
              /{lands?.rare?.total || totalLandNFTs.rare}
              {title === "Land NFTs Staked in Game *" && (
                <span className="smaller" style={{ color: "red" }}>
                  ({`-${lands?.rare?.total - lands?.rare?.current}`})
                </span>
              )}
            </span>
          </td>
        </tr>
        <tr>
          <th scope="row">Epic</th>
          <td>
            {lands?.epic?.current}
            <span className="smaller">
              /{lands?.epic?.total || totalLandNFTs.epic}
              {title === "Land NFTs Staked in Game *" && (
                <span className="smaller" style={{ color: "red" }}>
                  ({`-${lands?.epic?.total - lands?.epic?.current}`})
                </span>
              )}
            </span>
          </td>
        </tr>
        <tr>
          <th scope="row">Legendary</th>
          <td>
            {lands?.legendary?.current}
            <span className="smaller">
              /{lands?.legendary?.total || totalLandNFTs.legendary}
              {title === "Land NFTs Staked in Game *" && (
                <span className="smaller" style={{ color: "red" }}>
                  ({`-${lands?.legendary?.total - lands?.legendary?.current}`})
                </span>
              )}
            </span>
          </td>
        </tr>
        <tr>
          <th scope="row">Mythic</th>
          <td>
            {lands?.mythic?.current}
            <span className="smaller">
              /{lands?.mythic?.total || totalLandNFTs.mythic}
              {title === "Land NFTs Staked in Game *" && (
                <span className="smaller" style={{ color: "red" }}>
                  ({`-${lands?.mythic?.total - lands?.mythic?.current}`})
                </span>
              )}
            </span>
          </td>
        </tr>
      </tbody>
    );
  };

  // RENDER land NFTs (WAX & FLOW) in packs and in game
  const renderPacksPerBlockchain = (packs, title = undefined) => {
    return (
      <tbody>
        <tr>
          <th scope="row">Rancho</th>
          <td>
            {packs?.rancho?.total - packs?.rancho?.current}
            <span className="smaller">/{packs?.rancho?.total}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Mayor</th>
          <td>
            {packs?.mayor?.total - packs?.mayor?.current}
            <span className="smaller">/{packs?.mayor?.total}</span>
          </td>
        </tr>
        {packs?.governors && (
          <tr>
            <th scope="row">Governors</th>
            <td>
              {packs.governors.total - packs.governors.current}
              <span className="smaller">/{packs.governors.total}</span>
            </td>
          </tr>
        )}
        {packs?.bonus && (
          <tr>
            <th scope="row">
              Bonus <span className="smaller">(OPENED)</span>{" "}
            </th>
            <td>
              {packs.bonus.current}
              {/* <span className="smaller">/{packs.bonus.total}</span> */}
            </td>
          </tr>
        )}
      </tbody>
    );
  };

  // render 2 tables
  // type = function = EITHER renderPacksPerBlockchain OR renderLandTablePerBlockchain
  // items = lands OR packs
  // title = section title
  const renderTables = (title, type, items) => {
    return (
      <section className="section mb-4">
        <h2 className="section-title">{title}</h2>

        <div className="row justify-content-center">
          <div className="col-6 col-sm-5 col-md-4 col-lg-3">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="wax">
                    WAX
                  </th>
                  <th scope="col">
                    {items?.wax?.mayor
                      ? items?.wax?.mayor.total +
                        items?.wax?.rancho.total -
                        items?.wax?.mayor.current -
                        items?.wax?.rancho.current
                      : items?.wax?.common.current +
                        items?.wax?.rare.current +
                        items?.wax?.epic.current +
                        items?.wax?.legendary.current +
                        items?.wax?.mythic.current}
                    <span className="smaller">
                      {items?.wax?.mayor
                        ? `/${totalPacks.waxLands}`
                        : items?.wax?.common
                        ? `/${items?.waxTotalCurrent || totalLandNFTs.total}`
                        : "/..."}
                      &nbsp;
                      {title === "Land NFTs Staked in Game *" && (
                        <span className="smaller" style={{ color: "red" }}>
                          (
                          {`${
                            items?.wax?.common.current +
                            items?.wax?.rare.current +
                            items?.wax?.epic.current +
                            items?.wax?.legendary.current +
                            items?.wax?.mythic.current -
                            items?.waxTotalCurrent
                          }`}
                          )
                        </span>
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              {type(items?.wax, title)}
            </table>
          </div>
          <div className="col-6 col-sm-5 col-md-4 col-lg-3">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="flow">
                    FLOW
                  </th>
                  <th scope="col">
                    {items?.flow?.mayor
                      ? items?.flow?.mayor.total +
                        items?.flow?.rancho.total -
                        items?.flow?.mayor.current -
                        items?.flow?.rancho.current
                      : items?.flow?.common.current +
                        items?.flow?.rare.current +
                        items?.flow?.epic.current +
                        items?.flow?.legendary.current +
                        items?.flow?.mythic.current}
                    <span className="smaller">
                      {items?.wax?.mayor
                        ? `/${totalPacks.flowLands}`
                        : items?.flow?.common
                        ? `/${items?.flowTotalCurrent || totalLandNFTs.total}`
                        : "/..."}
                      &nbsp;
                      {title === "Land NFTs Staked in Game *" && (
                        <span className="smaller" style={{ color: "red" }}>
                          (
                          {`${
                            items?.flow?.common.current +
                            items?.flow?.rare.current +
                            items?.flow?.epic.current +
                            items?.flow?.legendary.current +
                            items?.flow?.mythic.current -
                            items?.flowTotalCurrent
                          }`}
                          )
                        </span>
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              {type(items?.flow, title)}
            </table>
          </div>
        </div>
        {title === "Land NFTs Staked in Game *" && (
          <span className="red-note">
            * (currently staked)/(total ever staked) for WAX. Flow ONLY shows
            total ever staked
          </span>
        )}
      </section>
    );
  };

  return (
    <div className="App">
      <h1 className="logo">
        Dark Country Stats
        <span className="logo-custom">COMMUNITY MADE</span>
      </h1>

      {/* TOKENS PRICES */}
      <section className="section mb-4">
        <h2 className="section-title">Tokens</h2>

        <div className="tokens-container mb-2">
          <div className="row">
            {/* WAX */}
            <div className="col-6">
              <div className="token mb-2">
                <span className="symbol wax">
                  <img src={waxSDM} alt="waxSDM icon" />
                </span>
              </div>
              {/* current wax sdm-wax*/}
              <div className="showOnHover">
                <span>{tokensPrice?.waxSDM?.toFixed(7)}</span>
                <span className="smaller"> SDM/WAX </span>
                <span
                  className="hide"
                  style={{
                    color: tokensPrice?.sdmWaxChange < 0 ? "red" : "green",
                  }}
                >
                  {tokensPrice?.sdmWaxChange?.toFixed(2)}%
                </span>
              </div>
              {/* initial wax sdm-wax */}
              <div className="hide">
                <span className="smaller">INITIAL: </span>
                <span>{initialSDMPrice.waxSDM}</span>
                <span className="smaller"> SDM/WAX</span>
              </div>
              {/* current wax sdm-wax*/}
              <div className="showOnHover">
                <span>{(0.00052 * tokensPrice?.usdWAX).toFixed(7)}</span>
                <span className="smaller"> SDM/USD</span>
                <span
                  className="hide"
                  style={{
                    color: tokensPrice?.sdmWaxChange < 0 ? "red" : "green",
                  }}
                >
                  {tokensPrice?.sdmUsdChange?.toFixed(2)}%
                </span>
              </div>
              {/* initial wax sdm-usd */}
              <div className="hide">
                <span className="smaller">INITIAL: </span>
                <span>
                  {(initialSDMPrice.waxSDM * initialSDMPrice.usdWAX).toFixed(4)}
                </span>
                <span className="smaller"> SDM(w)/USD</span>
              </div>
            </div>

            {/* FLOW */}
            <div className="col-6">
              <div className="token mb-2">
                <span className="symbol flow">
                  <img src={flowSDM} alt="flowSDM icon" />
                </span>
              </div>
              {/* current flow sdm-usdc*/}
              <div className="showOnHover">
                <span>{tokensPrice?.flowSDM?.toFixed(7)}</span>
                <span className="smaller"> SDM/USDC </span>
                <span
                  className="hide"
                  style={{
                    color: tokensPrice?.sdmFlowchange < 0 ? "red" : "green",
                  }}
                >
                  {tokensPrice?.sdmFlowchange?.toFixed(2)}%
                </span>
              </div>
              {/* initial flow */}
              <div className="hide">
                <span className="smaller">INITIAL: </span>
                <span>{initialSDMPrice.flowSDM}</span>
                <span className="smaller"> SDM/USDC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General Info */}
      <section className="section mb-4">
        <h2 className="section-title">Info</h2>
        <div className="tokens-container mb-5">
          <div className="row gy-2">
            <div className="col-6">
              <div className="token">
                <span className="smaller x2 info">In-game Land Owners: </span>
                <br></br>
                <span className="value">{generalInfo?.uniqueLandOwners}</span>
              </div>
            </div>

            <div className="col-6">
              <div className="token">
                <span className="smaller x2 info">
                  Mainnet Land game Started:{" "}
                </span>
                <br></br>
                <span className="value"> 07/07/2022</span>
              </div>
            </div>

            <div className="col-6">
              <div className="token">
                <span className="smaller x2 info">
                  FLOW Land sale profits:{" "}
                </span>
                <br></br>
                <span className="value"> 13-18/5/2021 | 26,700 $flow</span>
              </div>
            </div>

            <div className="col-6">
              <div className="token">
                <span className="smaller x2 info">WAX Land sale profits: </span>
                <br></br>
                <span className="value"> 25-29/5/2021 | 704K $ in $wax</span>
              </div>
            </div>

            <div className="col-6">
              <div className="token">
                <span className="smaller x2 info">Flow SDM initial LP: </span>
                <br></br>
                <span className="value"> 2K$ USDC</span>
              </div>
            </div>

            <div className="col-6">
              <div className="token">
                <span className="smaller x2 info">WAX SDM initial LP:</span>
                <br></br>
                <span className="value">1.3K$ in WAX</span>
              </div>
            </div>

            {/* <div className="col-6">
              <div className="token">
                <span className="smaller x2">Total land NFTs in-game: </span>
                <span className="price">
                  {generalInfo?.totalLandsInGame}
                  <span className="smaller">/8000</span>
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Lands in GAME */}
      {renderTables(
        "Land NFTs Staked in Game *",
        renderLandTablePerBlockchain,
        landsInGameState
      )}

      {/* Lands in PACKS */}
      {renderTables(
        "Land NFTs in Packs",
        renderLandTablePerBlockchain,
        landsInPacksState
      )}

      {/* unOpened Packs */}
      {renderTables(
        "UnOpened Packs",
        renderPacksPerBlockchain,
        openedPacksState
      )}

      {/* General Info */}
      <section className="section mb-4">
        <h2 className="section-title">Pack Sales for SDM</h2>
        <div className="tokens-container mb-5">
          <div className="row gy-2">
            {packSalesState?.map((packSale) => (
              <div className="col-12">
                <div className="token">
                  <span className="smaller x2 info">
                    {packSale.name} - {packSale.price} $SDM
                  </span>
                  <br></br>
                  <span className="value">
                    sold: {packSale.sold}/{packSale.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUGS */}
      {displayBugs && (
        <section className="section mb-4">
          <h2 className="section-title">Bugs/Updates (some)</h2>
          <h5 className="section-undertitle">
            Last fix/update deployed:
            <span className="important">
              {" "}
              {calculateLastDeployment(lastUpdatedState?.clientDeployment)} DAYS
            </span>{" "}
            ago**
          </h5>
          <span style={{ fontSize: "13px" }}>
            ** according to DC's discord announcements
          </span>

          <div className="container-fluid">
            <div className="row justify-content-center">
              {bugsState?.map((bug) => {
                return (
                  <div className="col-auto bug" key={bug?.id}>
                    <span className="bug-name">{bug?.name}</span>
                    <span
                      className={`circle ${bug?.status ? "green" : "red"}`}
                    ></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <hr></hr>
    </div>
  );
}
