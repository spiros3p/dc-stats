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
  mythic: 10
};

let landsInGame;
// let landsInGame = {
//   wax: {
//     common: {
//       total: 3140,
//       current: 453,
//       lastCurrent: -1
//     },
//     rare: {
//       total: 600,
//       current: 82,
//       lastCurrent: -1
//     },
//     epic: {
//       total: 200,
//       lastCurrent: -1,
//       current: 31
//     },
//     legendary: {
//       total: 50,
//       lastCurrent: -1,
//       current: 8
//     },
//     mythic: {
//       total: 10,
//       lastCurrent: -1,
//       current: 0
//     }
//   },
//   flow: {
//     common: {
//       total: 3140,
//       current: 726,
//       lastCurrent: -1
//     },
//     rare: {
//       total: 600,
//       current: 106,
//       lastCurrent: -1
//     },
//     epic: {
//       total: 200,
//       lastCurrent: -1,
//       current: 0
//     },
//     legendary: {
//       total: 50,
//       lastCurrent: -1,
//       current: 0
//     },
//     mythic: {
//       total: 10,
//       lastCurrent: -1,
//       current: 2
//     }
//   }
// };

let landsInPacks;
// let landsInPacks = {
//   wax: {
//     common: {
//       total: 3140,
//       current: 453,
//       lastCurrent: -1
//     },
//     rare: {
//       total: 600,
//       current: 82,
//       lastCurrent: -1
//     },
//     epic: {
//       total: 200,
//       lastCurrent: -1,
//       current: 31
//     },
//     legendary: {
//       total: 50,
//       lastCurrent: -1,
//       current: 8
//     },
//     mythic: {
//       total: 10,
//       lastCurrent: -1,
//       current: 0
//     }
//   },
//   flow: {
//     common: {
//       total: 3140,
//       current: 726,
//       lastCurrent: -1
//     },
//     rare: {
//       total: 600,
//       current: 106,
//       lastCurrent: -1
//     },
//     epic: {
//       total: 200,
//       lastCurrent: -1,
//       current: 0
//     },
//     legendary: {
//       total: 50,
//       lastCurrent: -1,
//       current: 0
//     },
//     mythic: {
//       total: 10,
//       lastCurrent: -1,
//       current: 2
//     }
//   }
// };

let openedPacks;
// let openedPacks = {
//   "wax": {
//     "rancho": {
//       "total": 2050,
//       "current": 1663,
//       "lastCurrent": -1,
//       "landsPerPack": 1,
//       "cardsPerPack": 0
//     },
//     "mayor": {
//       "total": 650,
//       "current": 573,
//       "lastCurrent": -1,
//       "landsPerPack": 3,
//       "cardsPerPack": 0
//     }
//   },
//   "flow": {
//     "rancho": {
//       "total": 2100,
//       "current": 1626,
//       "lastCurrent": -1,
//       "landsPerPack": 1,
//       "cardsPerPack": 5
//     },
//     "mayor": {
//       "total": 300,
//       "current": 229,
//       "lastCurrent": -1,
//       "landsPerPack": 3,
//       "cardsPerPack": 15
//     },
//     "governors": {
//       "total": 100,
//       "current": 89,
//       "lastCurrent": -1,
//       "landsPerPack": 10,
//       "cardsPerPack": 50
//     },
//     "bonus": {
//       "total": 0,
//       "current": 454,
//       "lastCurrent": -1,
//       "landsPerPack": 0,
//       "cardsPerPack": 5
//     }
//   }
// }

let bugs;
// let bugs = [
//   {
//     "id": 0,
//     "name": "Land game - Sheriff's office level 3 - NOT WORKING",
//     "status": false
//   },
//   {
//     "id": 1,
//     "name": "Card game - PVP mostly plays with default deck, ignoring custom decks",
//     "status": false
//   },
//   {
//     "id": 2,
//     "name": "Guild wars",
//     "status": false
//   },
//   {
//     "id": 3,
//     "name": "Farming to be launched (redoing our WAX farming tool, UI side remains)",
//     "status": false
//   },
//   {
//     "id": 4,
//     "name": "Buying Vampire packs for SDM on TopExpo. Or buy/sell any assets for SDM",
//     "status": false
//   },
//   {
//     "id": 5,
//     "name": "Buying Standard packs for SDM and unpacking them in lands or game client with the following mint on WAX or FLOW;",
//     "status": false
//   },
//   {
//     "id": 6,
//     "name": "Game client: leagues and seasons for PVP games",
//     "status": false
//   },
//   {
//     "id": 7,
//     "name": "Daily rewards for PVP games (unique card, common heroes)",
//     "status": false
//   },
//   {
//     "id": 8,
//     "name": "Corresponding infrastructure updates for all above;",
//     "status": false
//   },
//   {
//     "id": 9,
//     "name": "Pack auctions for SDM on WAX.",
//     "status": false
//   }
// ]

let lastUpdated;
// let lastUpdated = {
//   "weekly": 1661902856890,
//   "daily": 1661972093317,
//   "clientDeployment": 1660070887000
// }

let generalInfo;


export default function App() {
  const [fetched, setFetched] = useState();
  const [bugsState, setBugsState] = useState(bugs);
  const [openedPacksState, setOpenedPacksState] = useState(openedPacks);
  const [landsInPacksState, setLandsInPacksState] = useState(landsInPacks);
  const [landsInGameState, setLandsInGameState] = useState(landsInGame);
  const [lastUpdatedState, setLastUpdatedState] = useState(lastUpdated);
  const [generalInfoState, setGeneralInfoState] = useState(generalInfo);

  useEffect(()=>{
    console.log("gigo");
    fetchEverything();
  },[])

  useEffect(()=>{
    console.debug("RUN");
    setBugsState(bugs);
    setOpenedPacksState(openedPacks);
    setLandsInPacksState(landsInPacks);
    setLandsInGameState(landsInGame);
    setLastUpdatedState(lastUpdated);
    setGeneralInfoState(generalInfo);
  }, [fetched])

  const fetchEverything = async () => {
    try{
      const response = await axios.get(`${jsonserverURL}/bugs`);
      bugs = response.data;
      const response1 = await axios.get(`${jsonserverURL}/openedPacks`);
      openedPacks = response1.data;
      const response2 = await axios.get(`${jsonserverURL}/landsInPacks`);
      landsInPacks = response2.data;
      const response3 = await axios.get(`${jsonserverURL}/landsInGame`);
      landsInGame = response3.data;
      const response4 = await axios.get(`${jsonserverURL}/lastUpdated`);
      lastUpdated = response4.data;
      const response5 = await axios.get(`${jsonserverURL}/generalInfo`);
      generalInfo = response5.data;
      setFetched(true);
    }catch(e){
      if (e.response) {
        console.error(e.response.data);   
      }else{
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
        {packs?.governor && <tr>
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
                    items?.wax?.common.current + items?.wax?.rare.current + items?.wax?.epic.current + items?.wax?.legendary.current + items?.wax?.mythic.current }
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
                  <th scope="col">#</th>
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
      <div className="tokens-container mb-5">
        <div className="row">
          <div className="col-6">
            <div className="token">
              <span className="symbol wax"><img src={waxSDM} alt='waxSDM icon'/></span>
              <span className="price">0.005</span>
            </div>
          </div>
          <div className="col-6">
            <div className="token">
              <span className="symbol flow"><img src={flowSDM} alt='flowSDM icon'/></span>
              <span className="price">0.004</span>
            </div>
          </div>
        </div>
      </div>

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
