#!/bin/bash

# imports  
. scripts/envVar.sh

CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"
BFT="$5"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}
: ${BFT:=0}

: ${CONTAINER_CLI:="docker"}
if command -v ${CONTAINER_CLI}-compose > /dev/null 2>&1; then
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI}-compose"}
else
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI} compose"}
fi
infoln "Using ${CONTAINER_CLI} and ${CONTAINER_CLI_COMPOSE}"

# channel-artifacts 디렉터리가 없으면 생성함
if [ ! -d "channel-artifacts" ]; then
	mkdir channel-artifacts
fi

createChannelGenesisBlock() {
  setGlobals 1 # 첫 번째 조직의 글로벌 변수를 설정함
	which configtxgen # configtxgen 도구가 설치되어 있는지 확인
	if [ "$?" -ne 0 ]; then
		fatalln "configtxgen tool not found."
	fi
	local bft_true=$1
	set -x

	if [ $bft_true -eq 1 ]; then
		# BFT가 활성화된 경우 ChannelUsingBFT 프로파일을 사용
		configtxgen -profile ChannelUsingBFT -outputBlock ./channel-artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
	else #그렇지 않은 경우 ChannelUsingRaft 프로파일을 사용
		configtxgen -profile ChannelUsingRaft -outputBlock ./channel-artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
	fi
	res=$?
	{ set +x; } 2>/dev/null
  verifyResult $res "Failed to generate channel configuration transaction..."
}

createChannel() {
	# Poll in case the raft leader is not set yet
	local rc=1 # 반환 코드를 저장하는 rc 변수를 1로 초기화
	local COUNTER=1 # 시도 횟수를 저장하는 COUNTER 변수를 1로 초기화
	local bft_true=$1
	infoln "Adding orderers"
	#반환 코드가 0이 아니고 시도 횟수가 최대 재시도 횟수($MAX_RETRY)보다 작을 때까지 루프를 반복
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x
	# orderer.sh 스크립트를 실행하여 오더러를 추가합니다. 출력은 /dev/null로 리디렉션
    . scripts/orderer.sh ${CHANNEL_NAME}> /dev/null 2>&1
    if [ $bft_true -eq 1 ]; then
		# 추가 오더러 스크립트를 실행합니다. 출력은 /dev/null로 리디렉션
      . scripts/orderer2.sh ${CHANNEL_NAME}> /dev/null 2>&1
      . scripts/orderer3.sh ${CHANNEL_NAME}> /dev/null 2>&1
      . scripts/orderer4.sh ${CHANNEL_NAME}> /dev/null 2>&1
    fi
		res=$?
		{ set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	# res 값이 0이 아니면 "Channel creation failed"라는 메시지를 출력하고 스크립트를 종료
	verifyResult $res "Channel creation failed"
}

# joinChannel ORG
joinChannel() {
  ORG=$1
  FABRIC_CFG_PATH=$PWD/../config/
  setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
    peer channel join -b $BLOCKFILE >&log.txt
    res=$?
    { set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "After $MAX_RETRY attempts, peer0.org${ORG} has failed to join channel '$CHANNEL_NAME' "
}

setAnchorPeer() {
  ORG=$1
  . scripts/setAnchorPeer.sh $ORG $CHANNEL_NAME 
}


## User attempts to use BFT orderer in Fabric network with CA
if [ $BFT -eq 1 ] && [ -d "organizations/fabric-ca/ordererOrg/msp" ]; then
  fatalln "Fabric network seems to be using CA. This sample does not yet support the use of consensus type BFT and CA together."
fi

## Create channel genesis block
FABRIC_CFG_PATH=$PWD/../config/
BLOCKFILE="./channel-artifacts/${CHANNEL_NAME}.block"

infoln "Generating channel genesis block '${CHANNEL_NAME}.block'"
FABRIC_CFG_PATH=${PWD}/configtx
if [ $BFT -eq 1 ]; then # BFT가 활성화된 경우 BFT 구성 파일을 사용
  FABRIC_CFG_PATH=${PWD}/bft-config
fi
createChannelGenesisBlock $BFT


## Create channel
## Create channel
infoln "Creating channel ${CHANNEL_NAME}"
createChannel $BFT
successln "Channel '$CHANNEL_NAME' created"

## Join all the peers to the channel and set anchor peers
case $CHANNEL_NAME in
  material-supply-channel)
    infoln "Joining org1 peer to the channel..."
    joinChannel 1
    infoln "Joining org2 peer to the channel..."
    joinChannel 2
    infoln "Joining org7 peer to the channel..."
    joinChannel 7

    infoln "Setting anchor peer for org1..."
    setAnchorPeer 1
    infoln "Setting anchor peer for org2..."
    setAnchorPeer 2
    infoln "Setting anchor peer for org7..."
    setAnchorPeer 7
    ;;
  battery-ev-channel)
    infoln "Joining org2 peer to the channel..."
    joinChannel 2
    infoln "Joining org3 peer to the channel..."
    joinChannel 3
    infoln "Joining org7 peer to the channel..."
    joinChannel 7

    infoln "Setting anchor peer for org2..."
    setAnchorPeer 2
    infoln "Setting anchor peer for org3..."
    setAnchorPeer 3
    infoln "Setting anchor peer for org7..."
    setAnchorPeer 7
    ;;
  battery-update-channel)
    infoln "Joining org3 peer to the channel..."
    joinChannel 3
    infoln "Joining org4 peer to the channel..."
    joinChannel 4
    infoln "Joining org5 peer to the channel..."
    joinChannel 5
    infoln "Joining org7 peer to the channel..."
    joinChannel 7

    infoln "Setting anchor peer for org3..."
    setAnchorPeer 3
    infoln "Setting anchor peer for org4..."
    setAnchorPeer 4
    infoln "Setting anchor peer for org5..."
    setAnchorPeer 5
    infoln "Setting anchor peer for org7..."
    setAnchorPeer 7
    ;;
  recycled-material-extraction-channel)
    infoln "Joining org3 peer to the channel..."
    joinChannel 3
    infoln "Joining org6 peer to the channel..."
    joinChannel 6
    infoln "Joining org7 peer to the channel..."
    joinChannel 7

    infoln "Setting anchor peer for org3..."
    setAnchorPeer 3
    infoln "Setting anchor peer for org6..."
    setAnchorPeer 6
    infoln "Setting anchor peer for org7..."
    setAnchorPeer 7
    ;;
  recycled-material-supply-channel)
    infoln "Joining org2 peer to the channel..."
    joinChannel 2
    infoln "Joining org6 peer to the channel..."
    joinChannel 6
    infoln "Joining org6 peer to the channel..."
    joinChannel 7

    infoln "Setting anchor peer for org2..."
    setAnchorPeer 2
    infoln "Setting anchor peer for org6..."
    setAnchorPeer 6
    infoln "Setting anchor peer for org7..."
    setAnchorPeer 7
    ;;
  public-channel)
    infoln "Joining org1 peer to the channel..."
    joinChannel 1
    infoln "Joining org2 peer to the channel..."
    joinChannel 2
    infoln "Joining org3 peer to the channel..."
    joinChannel 3
    infoln "Joining org4 peer to the channel..."
    joinChannel 4
    infoln "Joining org5 peer to the channel..."
    joinChannel 5
    infoln "Joining org6 peer to the channel..."
    joinChannel 6
    infoln "Joining org7 peer to the channel..."
    joinChannel 7

    infoln "Setting anchor peer for org1..."
    setAnchorPeer 1
    infoln "Setting anchor peer for org2..."
    setAnchorPeer 2
    infoln "Setting anchor peer for org3..."
    setAnchorPeer 3
    infoln "Setting anchor peer for org4..."
    setAnchorPeer 4
    infoln "Setting anchor peer for org5..."
    setAnchorPeer 5
    infoln "Setting anchor peer for org6..."
    setAnchorPeer 6
    infoln "Setting anchor peer for org7..."
    setAnchorPeer 7
    ;;
  *)
    errorln "Channel name $CHANNEL_NAME is not recognized."
    exit 1
    ;;
esac

successln "Channel '$CHANNEL_NAME' joined"