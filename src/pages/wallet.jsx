import { useEffect, useState } from "react";
import "./wallet.scss";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import * as cadenceScripts from "../flow/cadence-scripts";
import sdmTokenIcon from "../media/sdmToken.png";

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "0xProfile": "0xc8c340cebd11f690", // the address where the DC smart contracts are deployed
});

const initSetTransferSDM = { to: "", amount: 0.0 };

export const Wallet = () => {
  const [user, setUser] = useState({});
  const [sdmWalletBalance, setSdmWalletBalance] = useState("-");
  const [transferSDM, setTransferSDM] = useState(initSetTransferSDM);
  const [trxStatus, setTrxStatus] = useState("draft"); //draft, loading, error, executed, sealed
  const [loadingStatusText, setLoadingStatusText] = useState("");
  const [trxErrorText, setTrxErrorText] = useState("");

  // subscribing to fcl.currentUser will set the user state after a succesful login or logout
  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    fetchSdmBalance();
  }, [user]);

  useEffect(() => {
    if (loadingStatusText === "PENDING") {
      setTrxStatus("loading");
    } else if (loadingStatusText === "EXECUTED") {
      setTrxStatus("executed");
    } else if (loadingStatusText === "SEALED") {
      setTrxStatus("sealed");
      changeStatusTextWithDelay("");
      fetchSdmBalance();
    }
  }, [loadingStatusText]);

  useEffect(() => {
    if (trxStatus === "sealed") {
      changeStatusWithDelay("draft");
    } else if (trxStatus === "draft") {
      setTransferSDM(initSetTransferSDM);
    }
  }, [trxStatus]);

  const fetchSdmBalance = async () => {
    try {
      const result = await fcl.query({
        cadence: cadenceScripts.fetchSsdmBalance,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setSdmWalletBalance(result);
    } catch (e) {
      console.log(
        JSON.stringify(e).includes("Could not borrow Balance capability")
      );
      setSdmWalletBalance("-");
    }
  };

  const submitTransferSDM = async (event) => {
    // event.preventDefault();
    setLoadingStatusText("PENDING");
    setTrxErrorText("");
    try {
      const amount = parseFloat(transferSDM.amount).toFixed(8);
      const address = transferSDM.to;
      console.log(address);
      console.log(amount);
      // const burnAmount = 0.0;
      const burnAmount = amount >= 100000 ? 10.00000000 : 5.00000000;

      // return
      const result = await fcl.mutate({
        // cadence: cadenceScripts.transferSDMToWallet,
        cadence: cadenceScripts.transferSDMToWalletWithBurn, // with Burn
        args: (arg, t) => [
          arg(amount, t.UFix64),
          arg(address, t.Address),
          arg(burnAmount, t.UFix64),
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      fcl.tx(result).subscribe(
        (res) => {
          console.log(res);
          if (!!res.errorMessage) {
            setTrxStatus("error");
            if (
              res.errorMessage.includes(
                "Could not borrow receiver reference to the recipient"
              )
            ) {
              setTrxErrorText("Receipient has not set up DC collection");
            } else if (
              res.errorMessage.includes(
                "Amount withdrawn must be less than or equal than the balance"
              )
            ) {
              setTrxErrorText("Overdrawn balance");
            } else {
              setTrxErrorText(
                "Open console to see the error and report please"
              );
            }
            changeStatusWithDelay("draft");
          } else {
            if (!!res.statusString) setLoadingStatusText(res.statusString);
          }
        },
        (error) => {
          console.error(error);
        }
      );

      console.log(result);
    } catch (e) {
      console.error(e);
    }
  };

  const setUpDCCollection = async () => {
    try {
      const result = await fcl.mutate({
        cadence: cadenceScripts.setUpDcCollection,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });
      fcl.tx(result).subscribe((res) => console.log);
      // console.log(result);
    } catch (e) {
      console.error(e);
    }
  };

  const changeStatusWithDelay = (status) => {
    setTimeout(() => {
      setTrxStatus(status);
    }, 3000);
  };

  const changeStatusTextWithDelay = (text) => {
    setTimeout(() => {
      setLoadingStatusText(text);
    }, 3000);
  };

  return (
    <>
      <div className="container-md">
        {!user.loggedIn ? (
          <div className="wrapper-disconnected">
            <button
              onClick={() => fcl.authenticate()}
              className="btn btn-light me-3 mb-3"
            >
              Connect
            </button>
            <h4 className="section-title">
              Connect with a FLOW wallet <br />
              to transfer SDM
            </h4>
          </div>
        ) : (
          <div className="wrapper-connected">
            <h4 className="section-title">
              {/* User's Address: */}
              <span className="user-address"> {user?.addr}</span>
              <button
                className="btn btn-light ms-3"
                onClick={() => fcl.unauthenticate()}
              >
                Disconnect
              </button>
            </h4>

            <div className="row justify-content-center">
              <div className="transfer-wrapper">
                <div className="transfer-panel">
                  <div className="transfer-panel-header-wrapper">
                    <div className="transfer-panel-header">
                      <h5 className="title">Transfer</h5>
                      <div className="options"></div>
                    </div>
                  </div>
                  <div className="transfer-panel-body-wrapper">
                    <div className="transfer-panel-body">
                      <div className="transfer-form-wrapper">
                        <div className="transfer-form">
                          <div className="transfer-form-group">
                            <div className="transfer-form-group-upper">
                              <div className="token">
                                <div className="token-icon">
                                  <img
                                    src={sdmTokenIcon}
                                    alt="flowSDM icon"
                                    className="me-2 "
                                  />
                                </div>
                                <span className="token-label">SDM</span>
                              </div>
                              <div className="balance">
                                <span className="balance-label">Balance:</span>
                                <span className="balance-amount">
                                  {sdmWalletBalance}
                                </span>
                              </div>
                            </div>
                            <div className="transfer-form-group-lower">
                              <div className="input-wrapper">
                                <input
                                  type="number"
                                  value={transferSDM.amount}
                                  onChange={(e) =>
                                    setTransferSDM({
                                      ...transferSDM,
                                      amount: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <span className="transfer-panel-information-group-label">
                                <b>5</b> SDM fee applies or <b>10</b> SDM for
                                transfers over 100,000 SDM
                              </span>
                            </div>
                          </div>

                          <div className="transfer-form-group">
                            <div className="transfer-form-group-upper">
                              <div className="wallet">
                                <div className="wallet-label">
                                  <span>Transfer to wallet*:</span>
                                </div>
                              </div>
                            </div>
                            <div className="transfer-form-group-lower">
                              <div className="input-wrapper">
                                <input
                                  type="text"
                                  value={transferSDM.to}
                                  onChange={(e) =>
                                    setTransferSDM({
                                      ...transferSDM,
                                      to: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="transfer-panel-information-wrapper">
                    <div className="transfer-panel-information">
                      <div className="transfer-panel-information-group">
                        <span className="transfer-panel-information-group-label">
                          * receiving wallet must have DC collection set up
                        </span>
                      </div>
                      <div className="transfer-panel-information-group">
                        <span className="transfer-panel-information-group-label">
                          set up DC collection on your wallet
                        </span>
                        <button
                          className="btn btn-light"
                          onClick={() => setUpDCCollection()}
                        >
                          Initialize
                        </button>
                      </div>
                      {!!trxErrorText && (
                        <div className="error-notification">
                          ERROR: {trxErrorText}
                        </div>
                      )}
                      {trxStatus === "sealed" && (
                        <div className="success-notification">
                          Transfer was successfully completed
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="transfer-panel-footer-wrapper">
                    <div className="transfer-panel-footer">
                      <div className="form-btn-group">
                        {(trxStatus === "draft" || trxStatus === "error") && (
                          <button
                            className="btn btn-primary btn-submit"
                            type="button"
                            onClick={submitTransferSDM}
                          >
                            Transfer
                          </button>
                        )}
                        {trxStatus === "loading" && (
                          <button className="btn btn-secondary btn-status">
                            <span className="label">{loadingStatusText}</span>
                            <div
                              className="spinner-grow text-light"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </button>
                        )}
                        {trxStatus === "executed" && (
                          <button className="btn btn-success btn-status">
                            <span className="label">
                              {loadingStatusText}...
                            </span>
                          </button>
                        )}
                        {trxStatus === "sealed" && (
                          <button className="btn btn-success btn-status">
                            <span className="label">{loadingStatusText}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
