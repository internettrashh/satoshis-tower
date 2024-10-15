import { createDataItemSigner, message, result, results } from "@permaweb/aoconnect";

const gameProcessId = "ih1XlIJWNtaG_544IIHMFw9BOp3HBOQ5fwJogeIY76w";
const tokenContractId = "pEbKJIK4PnClZrB_nZUvjPVDOHhp36PkvphrhN2_lDs";
export const placeBet = async (betAmount: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await message({
      process: tokenContractId,
      tags: [
        { name: "Action", value: "Transfer" },
        { name: "Recipient", value: gameProcessId },
        { name: "Quantity", value: betAmount.toString() },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: "",
    });
    //getting gasme id from the resposn se from this
    const gameId = await getGameId();
    return gameId;
  } catch (error) {
    alert("Error placing bet:");
    throw error;
  }
};

export const makeMove = async (gameId: string, column: number) => {
  try {
    console.log("Making move with gameId:", gameId, "and column:", column + 1);
    const response = await message({
      process: gameProcessId,
      tags: [
        { name: "Action", value: "MakeMove" },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: JSON.stringify({ gameId, column: column + 1 }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Output, Messages } = await result({
      message: response,
      process: gameProcessId,
    });
    console.log("Move made. Output:", Messages);

    if (Messages && Messages.length > 0) {
      return JSON.parse(Messages[0].Data);
    }
    return null;
  } catch (error) {
    console.error("Error making move:", error);
    throw error;
  }
};

export const getGameId = async () => {
  let newGameId;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cursor = null;

  while (newGameId === undefined) {
    const resultsOut = await results({
      process: gameProcessId,
      sort: "DESC",
      limit: 1,
    });

    if (resultsOut.edges && resultsOut.edges.length > 0) {
      for (const edge of resultsOut.edges) {
        if (edge.node && edge.node.Messages && edge.node.Messages.length > 0) {
          try {
            const gameData = JSON.parse(edge.node.Messages[0].Data);
            if (gameData.gameId) {
              newGameId = gameData.gameId;
              break;
            }
          } catch (error) {
            console.error("Error parsing message data:", error);
          }
        }
      }

      if (newGameId === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars

        cursor = resultsOut.edges[resultsOut.edges.length - 1].cursor;
      }
    }

    if (newGameId === undefined) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return newGameId;
};
export const cashOut = async (gameId: string) => {
    try {
      const response = await message({
        process:gameProcessId, 
        tags: [
          { name: "Action", value: "CashOut" },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
        data: JSON.stringify({ gameId }),
      });
  
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { Output, Messages } = await result({
        message: response,
        process: gameProcessId,
      });
  
      if (Messages && Messages.length > 0) {
        const cashOutResult = JSON.parse(Messages[0].Data);
        console.log("Cash out result:", cashOutResult);
        return cashOutResult.multiplier;
      }
      return null;
    } catch (error) {
      console.error("Error cashing out:", error);
      throw error;
    }
  };
