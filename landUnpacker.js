import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";

import LoadingOverlay from 'react-loading-overlay';
import { toast } from "react-toastify";
import { Helmet } from 'react-helmet';

import axios from "axios";

import * as fcl from "@onflow/fcl";

import './LandUnpacker.scss';

import UnpackerResultModal from '../../modals/UnpackerResultModal/UnpackerResultModal';

import backgroundImage from '../../resourses/unpacker/images/bg_with_smoke_light.png';
import altar from '../../resourses/unpacker/images/altar.png';
import coffin from '../../resourses/unpacker/images/coffin.png';
import lightedCoffin from '../../resourses/unpacker/images/lighted_coffin.png';
import bookShelf from '../../resourses/unpacker/images/book_shelf_hero.png';
import table from '../../resourses/unpacker/images/table_hero.png';
import bell from '../../resourses/unpacker/images/bell_btn.png';
import bellActive from '../../resourses/unpacker/images/bell_btn_active.png';
import currencyMark from '../../resourses/unpacker/images/currency_mark.png';
import yeti from '../../resourses/unpacker/images/yeti.png';

import RanchoPack from '../../resourses/packs/Rancho.png';
import MayorPack from '../../resourses/packs/Mayor.png';
import GovernorPack from '../../resourses/packs/Governor.png';
import BonusPack from '../../resourses/packs/Bonus.png';

import bg_sound from '../../resourses/unpacker/sounds/background.mp3';
import bell_sound from '../../resourses/unpacker/sounds/Bell.mp3';
import pack_placed_sound from '../../resourses/unpacker/sounds/Pack_placed.mp3';
import pack_opens_sound from '../../resourses/unpacker/sounds/Pack_opens.mp3';

import bg_video_unpacking_and_cycled from '../../resourses/unpacker/videos/UnpackingAndCycled.mp4';

import CommonLandVideo from '../../resourses/lands/videos/Common__xvid.mp4';
import RareLandVideo from '../../resourses/lands/videos/Rare__xvid.mp4';
import EpicLandVideo from '../../resourses/lands/videos/Epic__xvid.mp4';
import LegendaryLandVideo from '../../resourses/lands/videos/Legendary__xvid.mp4';
import MythicalLandVideo from '../../resourses/lands/videos/Mithycal__xvid.mp4';

import {
    FLOW_UNPACKER_API,
    MARKET_NFT_API
} from "../../constants/aws.constants";
import {
    COMMON_LAND_NAME,
    RARE_LAND_NAME,
    EPIC_LAND_NAME,
    LEGENDARY_LAND_NAME,
    MYTHICAL_LAND_NAME
} from "../../constants/land.constants";
import {
    PACK_1_ITEM_TEMPLATE_ID,
    PACK_2_ITEM_TEMPLATE_ID,
    PACK_3_ITEM_TEMPLATE_ID,
    BONUS_PACK_TEMPLATE_ID
} from "../../constants/pack.constants";
import {
    ADDRESS_FOR_TRANSFER
} from "../../constants/contract.constants";

import { readCollectionIds, transferPack } from '../../flow';

export default function LandUnpacker() {
    const [packs, setPacks] = useState([]);
    const [selectedPack, setSelectedPack] = useState(null);
    const [landsEarned, setLandsEarned] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [unpackedTimestamp, setUnpackedTimestamp] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');

    const history = useHistory();

    const user = useSelector(({ auth }) => auth.auth);

    const fetchUserPacksIds = () => {
        readCollectionIds({ address: user.addr })
            .then(ids => fetchUserPacks(ids))
            .catch((e) => toast.error(e.message));
    };

    useEffect(() => {
        if (user.addr)
            fetchUserPacksIds();
    }, [user]);

    useEffect(() => {
        if (unpackedTimestamp && selectedPack) {
            setLoadingText('Unpacking...');
            setLoading(true);

            unpack(selectedPack.item_id)
                .then(() => {
                    setSelectedPack(null);

                    startUnpackingVideo();
                })
                .catch(e => handleError(e))
                .finally(() => setLoading(false));
        }

    }, [unpackedTimestamp]);

    const signIn = () => fcl.authenticate();

    const unpackVideo = useRef(null);
    const unpackVideoDiv = useRef(null);

    const audioBg = (<audio id="bgMusic" src={bg_sound} loop autoPlay />);
    const audioBell = new Audio(bell_sound);
    const audioPackPlaced = new Audio(pack_placed_sound);
    const audioPackOpens = new Audio(pack_opens_sound);

    const playSound = (audioName) => {
        audioName.volume = 0.25;
        audioName.play();
    };

    const fetchUserPacks = (ids) => {
        if (ids.length)
            axios.get(`${MARKET_NFT_API}/user-nfts?itemIds=${ids.join(',')}`)
                .then(({ data }) => groupItems(data))
                .catch((e) => toast.error(e.message));
        else
            setPacks([]);
    };

    const groupItems = (items) => {
        const result = [];

        items
            .filter(({ item_template_id }) => [2, 3, 4, 5].includes(item_template_id))
            .forEach(item => {
                const foundItem = result.find(({ item_template_id }) => item.item_template_id === item_template_id);

                if (foundItem)
                    foundItem.amount++;
                else
                    result.push({ ...item, amount: 1, image: getImageByPackTemplateId(item.item_template_id) });
            });

        setPacks(result);
    };

    const getImageByPackTemplateId = (itemTemplateId) => {
        switch (itemTemplateId) {
            case PACK_1_ITEM_TEMPLATE_ID:
                return RanchoPack;

            case PACK_2_ITEM_TEMPLATE_ID:
                return MayorPack;

            case PACK_3_ITEM_TEMPLATE_ID:
                return GovernorPack;

            case BONUS_PACK_TEMPLATE_ID:
                return BonusPack;

            default:
                return '';
        }
    };

    const getVideoByLandName = (landName) => {
        switch (landName) {
            case COMMON_LAND_NAME:
                return CommonLandVideo;

            case RARE_LAND_NAME:
                return RareLandVideo;

            case EPIC_LAND_NAME:
                return EpicLandVideo;

            case LEGENDARY_LAND_NAME:
                return LegendaryLandVideo;

            case MYTHICAL_LAND_NAME:
                return MythicalLandVideo;

            default:
                return '';
        }
    };

    const unpack = async (packId) => {
        await transferPack({
            recipient: ADDRESS_FOR_TRANSFER,
            packId
        });
    };

    const startUnpackingVideo = () => {
        unpackVideoDiv.current.style.display = 'block';

        if (unpackVideo) {
            unpackVideo.current.load();
            unpackVideo.current.play();

            setTimeout(() => {
                unpackVideo.current.pause();

                setLoadingText('Getting unpacked data...');
                setLoading(true);

                getUnpackedLands()
                    .catch(e => handleError(e))
                    .finally(() => setLoading(false))
            }, 8.5 * 1000);
        }

        setTimeout(() => playSound(audioPackOpens), 1000);
    };

    const getUnpackedLands = async () => {
        const lands = (await fetchUnpackedLands())
            .map(land => {
                return {
                    ...land,
                    videoLink: getVideoByLandName(land.data.name),
                    imageLink: land.data.mediaUrl
                }
            })
            .sort((element1, element2) => element2.item_id - element1.item_id);

        setLandsEarned(lands);
        setOpenModal(true);
    };

    const fetchUnpackedLands = async () => {
        const { data } = await axios.get(`${FLOW_UNPACKER_API}?userAddress=${user.addr}&unpackedTimestamp=${unpackedTimestamp}`);

        if (!data.length) {
            await sleep(1000);

            return await fetchUnpackedLands();
        }

        return data;
    };

    const handleError = (error) => {
        console.log(error);
        hideVideo();
        toast.error(error);
    };

    const hideVideo = () => {
        if (unpackVideoDiv)
            unpackVideoDiv.current.style.display = 'none';
    };

    const renderFiveCards = () => {
        playSound(audioBell);

        setUnpackedTimestamp(new Date().getTime());
    };

    const responsivePackStyle = () => {
        const percentage = 4.5;
        return `${packs.length * percentage}%`;
    };

    const renderPacks = (pack) => {
        return (
            <div className="item-and-quantity-container" key={pack.data.name}>
                <div className="book-container" onClick={() => onPackSelect(pack)}>
                    <img
                        src={pack.image}
                        className="book-image"
                        alt=""
                        draggable={true}
                        onDragStart={(event) => dragPack(event, pack.item_id)}
                        data-id={pack.data.name}
                        onMouseEnter={(event) => onImageHover(event)}
                        onMouseLeave={(event) => onImageHoverEnd(event)}
                    />
                </div>
                <div className="book-quantity-container">
                    <img src={currencyMark} alt="" />
                    <p className="quantity-text">{pack.amount}</p>
                </div>
            </div>
        );
    };

    const onPackSelect = (pack) => {
        console.log('pack selected', pack);

        setSelectedPack(pack);

        playSound(audioPackPlaced);
    };

    const dragPack = (event, packItemId) => {
        if (selectedPack)
            setSelectedPack(null);

        event.dataTransfer.setData('packItemId', packItemId);
    };

    const onImageHover = (event) => {
        event.target.classList.add('book-image--scale');

        return (event.target.style.marginLeft = "-20%");
    };

    const onImageHoverEnd = (event) => {
        event.target.classList.remove('book-image--scale');

        return (event.target.style.marginLeft = "0");
    };

    const dropItem = (event) => {
        event.preventDefault();

        const packItemId = event.dataTransfer.getData("packItemId");
        const pack = packs.find(p => p.item_id === packItemId);

        if (pack) {
            setSelectedPack(pack);
            playSound(audioPackPlaced);
        }
    };

    const allowDrop = (event) => {
        event.preventDefault();
    };

    const renderPackToTable = (pack) => {
        if (!pack)
            return <div />;

        return <img
            src={pack.image}
            className="book-on-table-image"
            onClick={() => onPackUnselect()}
            alt=""
        />
    };

    const onPackUnselect = () => {
        setSelectedPack(null);
    };

    const onAllCardsSeen = () => {
        fetchUserPacksIds();

        setOpenModal(false);

        hideVideo();
    };

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    return (
        <>
            <Helmet>
                <title>
                    Unpacker | Dark Country | American gothic trading card game
                </title>
            </Helmet>
            <>{ audioBg }</>
            <div className="card-unpacker">
                <img
                    className="background-image"
                    src={backgroundImage}
                    alt=""
                    draggable={false}
                />
                <div className="overlay" ref={unpackVideoDiv}>
                    <video
                        ref={unpackVideo}
                        width="100%"
                        height="100%"
                        loop
                        src={bg_video_unpacking_and_cycled}
                    />
                </div>
                <div className="my-cards-container" onClick={() => history.push('/my-items')}>
                    <div className="my-cards-image-cover">
                        <img
                            className="my-cards-image"
                            src={yeti}
                            alt=""
                            draggable={false}
                        />
                    </div>
                    <span className="my-items-text">My items</span>
                </div>
                <img
                    className="coffin-image lighted-coffin-image"
                    src={lightedCoffin}
                    alt=""
                    style={{ visibility: selectedPack ? "visible" : "hidden" }}
                    draggable={false}
                />
                <img
                    className="coffin-image"
                    src={coffin}
                    alt=""
                    style={{ visibility: selectedPack ? "hidden" : "visible" }}
                    draggable={false}
                />
                <img className="altar-image" src={altar} alt="" draggable={false} />
                <img
                    className="bookShelf-image"
                    src={bookShelf}
                    alt=""
                    draggable={false}
                />
                <img className="table-image" src={table} alt="" draggable={false} />
                <div
                    className="dnd-container"
                    onDrop={(event) => dropItem(event)}
                    onDragOver={(event) => allowDrop(event)}
                />
                <img
                    className="bell-image bell-image-active"
                    src={bellActive}
                    alt=""
                    style={{ visibility: selectedPack ? "visible" : "hidden" }}
                    onClick={() => renderFiveCards()}
                    draggable={false}
                />
                <img
                    className="bell-image"
                    src={bell}
                    alt=""
                    style={{ visibility: selectedPack ? "hidden" : "visible" }}
                    draggable={false}
                />
                <div
                    className="list-of-hero-packs"
                    style={{ maxWidth: responsivePackStyle() }}
                >
                    { packs && packs.map((pack => renderPacks(pack))) }
                </div>
                {packs.length < 1 && (
                    <div className="buy-items-container buy-hero-packs">
                        { user && !user.addr
                            ? <span onClick={signIn}>Sign In</span>
                            : <span>
                                <a
                                    href="https://topexpo.io/market"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Buy Pack
                                </a>
                            </span>
                        }
                    </div>
                )}
                { renderPackToTable(selectedPack) }
                <UnpackerResultModal
                    visible={openModal}
                    onClose={() => {}}
                    onDoneClicked={() => onAllCardsSeen()}
                    landsEarned={landsEarned}
                    cardsEarned={[]}
                />
            </div>
            <LoadingOverlay
                active={loading}
                spinner
                text={loadingText}
            />
        </>
    );
};
