import "./styles.scss";
import flowSDM from "./media/flowSDM.png";
import waxSDM from "./media/waxSDM.png";
import { useEffect, useState } from "react";
import axios from "axios";

const jsonserverURL = "http://83.212.109.193:3030/dc-stats";

const totalLandNFTs = {
  common: 3140,
  rare: 600,
  epic: 200,
  legendary: 50,
  mythic: 10,
  total: 4000
};

const totalPacks = {
  "waxLands": 2700,
  "flowLands": 2500,
  "flowBonus": 0
}

const initialSDMPrice = {
  "waxSDM": 0.0132, //wax 
  "flowSDM": 0.001, //usd
  "usdWAX": 0.08842 // 16/6/22
}

let bugs;
let openedPacks;
let landsInPacks;
let landsInGame;
let lastUpdated;
let generalInfo;
let tokensPrice; //soon

export default function App() {
  const [fetched, setFetched] = useState(false);
  const [bugsState, setBugsState] = useState(bugs);
  const [openedPacksState, setOpenedPacksState] = useState(openedPacks);
  const [landsInPacksState, setLandsInPacksState] = useState(landsInPacks);
  const [landsInGameState, setLandsInGameState] = useState(landsInGame);
  const [lastUpdatedState, setLastUpdatedState] = useState(lastUpdated);
  const [generalInfoState, setGeneralInfoState] = useState(generalInfo);
  const [tokensPriceState, setTokensPriceState] = useState(tokensPrice);

  useEffect(() => {
    fetchEverything();
  }, [])

  useEffect(() => {
    // console.log("RUN");
    setBugsState(bugs);
    setOpenedPacksState(openedPacks);
    setLandsInPacksState(landsInPacks);
    setLandsInGameState(landsInGame);
    setLastUpdatedState(lastUpdated);
    setGeneralInfoState(generalInfo);
    setTokensPriceState(tokensPrice);
  }, [fetched])

  const fetchEverything = async () => {
    try {
      const response = await axios.all([
        axios.get(`${jsonserverURL}/bugs`),
        axios.get(`${jsonserverURL}/openedPacks`),
        axios.get(`${jsonserverURL}/landsInPacks`),
        axios.get(`${jsonserverURL}/landsInGame`),
        axios.get(`${jsonserverURL}/lastUpdated`),
        axios.get(`${jsonserverURL}/generalInfo`),
      ])
      bugs = response[0].data;
      openedPacks = response[1].data;
      landsInPacks = response[2].data;
      landsInGame = response[3].data;
      lastUpdated = response[4].data;
      generalInfo = response[5].data;
      setFetched(true);
    } catch (e) {
      if (e.response) {
        console.error(e.response.data);
      } else {
        console.error(e);
      }
    }
  }

  const calculateLastDeployment = (timestamp) => {
    let today = new Date();
    let difference = today - timestamp;
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays
  }

  // RENDER land NFTs (WAX & FLOW) in packs and in game
  const renderLandTablePerBlockchain = (lands) => {
    return (
      <tbody>
        <tr>
          <th scope="row" >Common</th>
          <td>
            {lands?.common?.current}
            <span className="smaller">/{totalLandNFTs.common}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Rare</th>
          <td>
            {lands?.rare?.current}
            <span className="smaller">/{totalLandNFTs.rare}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Epic</th>
          <td>
            {lands?.epic?.current}
            <span className="smaller">/{totalLandNFTs.epic}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Legendary</th>
          <td>
            {lands?.legendary?.current}
            <span className="smaller">/{totalLandNFTs.legendary}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Mythic</th>
          <td>
            {lands?.mythic?.current}
            <span className="smaller">/{totalLandNFTs.mythic}</span>
          </td>
        </tr>

      </tbody>
    )
  }

  // RENDER land NFTs (WAX & FLOW) in packs and in game
  const renderPacksPerBlockchain = (packs) => {
    return (
      <tbody>
        <tr>
          <th scope="row" >Rancho</th>
          <td>
            {packs?.rancho?.total - packs?.rancho?.current}
            <span className="smaller">/{packs?.rancho?.total}</span>
          </td>
        </tr>
        <tr>
          <th scope="row" >Mayor</th>
          <td>
            {packs?.mayor?.total - packs?.mayor?.current}
            <span className="smaller">/{packs?.mayor?.total}</span>
          </td>
        </tr>
        {packs?.governors && <tr>
          <th scope="row" >Governors</th>
          <td>
            {packs.governors.total - packs.governors.current}
            <span className="smaller">/{packs.governors.total}</span>
          </td>
        </tr>}
        {packs?.bonus && <tr>
          <th scope="row" >Bonus <span className="smaller">(OPENED)</span> </th>
          <td>
            {packs.bonus.current}
            {/* <span className="smaller">/{packs.bonus.total}</span> */}
          </td>
        </tr>}
      </tbody>
    )
  }

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
                  <th scope="col" className="wax">WAX</th>
                  <th scope="col">
                    {items?.wax?.mayor ?
                      items?.wax?.mayor.total + items?.wax?.rancho.total - items?.wax?.mayor.current - items?.wax?.rancho.current
                      :
                      items?.wax?.common.current + items?.wax?.rare.current + items?.wax?.epic.current + items?.wax?.legendary.current + items?.wax?.mythic.current}
                    <span className="smaller">
                      {items?.wax?.mayor ? `/${totalPacks.waxLands}` : items?.wax?.common ? `/${totalLandNFTs.total}` : '/...'}
                      &nbsp;
                    </span>
                  </th>
                </tr>
              </thead>
              {type(items?.wax)}
            </table>
          </div>
          <div className="col-6 col-sm-5 col-md-4 col-lg-3">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="flow">FLOW</th>
                  <th scope="col">
                    {items?.flow?.mayor ?
                      items?.flow?.mayor.total + items?.flow?.rancho.total - items?.flow?.mayor.current - items?.flow?.rancho.current
                      :
                      items?.flow?.common.current + items?.flow?.rare.current + items?.flow?.epic.current + items?.flow?.legendary.current + items?.flow?.mythic.current}
                    <span className="smaller">
                      {items?.wax?.mayor ? `/${totalPacks.flowLands}` : items?.flow?.common ? `/${totalLandNFTs.total}` : '/...'}
                      &nbsp;
                    </span>
                  </th>
                </tr>
              </thead>
              {type(items?.flow)}
            </table>
          </div>
        </div>
      </section>
    )
  }

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
              <div className="token">
                <span className="symbol wax"><img src={waxSDM} alt='waxSDM icon' /></span>
                {/* <span className="price">0.005</span> */}
              </div>
              {/* current wax sdm-wax*/}
              <div>
                <span>0.00052</span>
                <span className="smaller"> SDM/WAX</span>
              </div>
              {/* initial wax sdm-wax */}
              <div>
                <span className="smaller">INITIAL: </span>
                <span>{initialSDMPrice.waxSDM}</span>
                <span className="smaller"> SDM/WAX</span>
              </div>
              {/* current wax sdm-wax*/}
              <div>
                <span>{(0.00052 * 0.094).toFixed(5)}</span>
                <span className="smaller"> SDM/USD</span>
              </div>
              {/* initial wax sdm-usd */}
              <div>
                <span className="smaller">INITIAL: </span>
                <span>{(initialSDMPrice.waxSDM * initialSDMPrice.usdWAX).toFixed(4)}</span>
                <span className="smaller"> SDM(w)/USD</span>
              </div>
            </div>
            {/* FLOW */}
            <div className="col-6">
              <div className="token">
                <span className="symbol flow"><img src={flowSDM} alt='flowSDM icon' /></span>
                {/* <span className="price">0.004</span> */}
              </div>
              {/* current flow sdm-usdc*/}
              <div >
                <span>0.0000479</span>
                <span className="smaller"> SDM/USDC</span>
              </div>
              {/* initial flow */}
              <div>
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
          <div className="row">
            <div className="col-6">
              <div className="token">
                <span className="smaller x2">In-game Land Owners: </span>
                <span className="price">{generalInfo?.uniqueLandOwners}</span>
              </div>
            </div>
            <div className="col-6">
              <div className="token">
                <span className="smaller x2">Total land NFTs in-game: </span>
                <span className="price">
                  {generalInfo?.totalLandsInGame}
                  <span className="smaller">/8000</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lands in GAME */}
      {renderTables("Land NFTs Staked in Game", renderLandTablePerBlockchain, landsInGameState)}

      {/* Lands in PACKS */}
      {renderTables("Land NFTs in Packs", renderLandTablePerBlockchain, landsInPacksState)}

      {/* unOpened Packs */}
      {renderTables("UnOpened Packs", renderPacksPerBlockchain, openedPacksState)}

      {/* BUGS */}
      <section className="section mb-4">
        <h2 className="section-title">Bugs/Updates</h2>
        <h5 className="section-undertitle">
          Last fix/update deployed:
          <span className="important"> {calculateLastDeployment(lastUpdatedState?.clientDeployment)} DAYS</span> ago
        </h5>

        <div className="container-fluid">
          <div className="row justify-content-center">
            {bugsState?.map(bug => {
              return (
                <div className="col-auto bug" key={bug?.id}>
                  <span className="bug-name">{bug?.name}</span>
                  <span className={`circle ${bug?.status ? 'green' : 'red'}`}></span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <hr></hr>
    </div>
  );
}
