import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { getDateRange, parseDate } from "./time.ts";

const fetchBitQueryData = async (query: string) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${Deno.env.get("BITQUERY_TOKEN")}`);

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: query,
  };

  const resp = await fetch("https://streaming.bitquery.io/eap", requestOptions);
  return await resp.json();
};

const fetchTopPumpFunTokens = async () => {
  const query = JSON.stringify({
    query: `query TopPumpFunTokensByPrice {
        Solana {
          DEXTrades(
            limitBy: {by: Trade_Buy_Currency_MintAddress, count: 1}
            limit: {count: 10 }
            orderBy: {descending: Trade_Buy_PriceInUSD}
            where: {Trade: {Dex: {ProtocolName: {is: "pump"}}, Buy: {Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}}}, Transaction: {Result: {Success: true}}}
          ) {
            Trade {
              Buy {
                PriceInUSD
                Currency {
                  Name
                  Symbol
                  MintAddress
                  Uri
                }
              }
            }
          }
        }
      }`,
    variables: {},
  });

  try {
    const result = await fetchBitQueryData(query);
    const tokens = await Promise.all(
      result.data.Solana.DEXTrades.map(async (trade) => {
        const { Name, Symbol, MintAddress, Uri } = trade.Trade.Buy.Currency;
        const PriceInUSD = trade.Trade.Buy.PriceInUSD;

        let metadata = {};
        try {
          const metadataResponse = await fetch(Uri);
          metadata = await metadataResponse.json();
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }

        const richDataResponse = await fetch(
          `https://frontend-api.pump.fun/coins/${MintAddress}`,
        );

        const richData = await richDataResponse.json();

        // Extract or compute additional fields if needed
        const creator = richData.creator;
        const imageUri = richData.image_uri;
        const marketCap = richData.usd_market_cap;

        return {
          chain_id: 1,
          price: PriceInUSD,
          token_supply: 1000000000,
          mint_address: MintAddress,
          name: Name,
          symbol: Symbol,
          metadata: metadata,
          creator_address: creator,
          image_uri: imageUri,
          market_cap: marketCap,
          created_at: new Date(),
          updated_at: new Date(),
        };
      }),
    );

    return tokens;
  } catch (error) {
    console.error("Error fetching top pump fun tokens:", error);
    return [];
  }
};

const fetchPumpFunTokenTrades = async (data, startTime, endTime) => {
  const tokenTrades = [];
  for (const token of data) {
    const { id, mint_address } = token;
    const query = JSON.stringify({
      query:
        `query pumpfunTokenLatestTrades($mintAddress: String, $startTime: DateTime, $endTime: DateTime) {
        Solana {
          DEXTradeByTokens(
            orderBy: {descending: Block_Time}
            where: {
              Block: {
                Time: {
                  since: $startTime
                  till: $endTime
                }
              }
              Trade: {
                Currency: {
                  MintAddress: {is: $mintAddress}
                }
                Price: {gt: 0}
                Dex: {
                  ProtocolName: {is: "pump"}
                }
              }
              Transaction: {
                Result: {Success: true}
              }
            }
          ) {
            Block {
              allTime: Time
            }
            Trade {
              Side {
                Type
                Account {
                  Address
                }
              }
              PriceInUSD
              Amount
            }
          }
        }
      }`,
      variables: {
        mintAddress: mint_address,
        startTime: startTime,
        endTime: endTime,
      },
    });

    try {
      const result = await fetchBitQueryData(query);

      const trades = result.data.Solana.DEXTradeByTokens.map((trade) => {
        const { PriceInUSD } = trade.Trade;
        const { Type, Account } = trade.Trade.Side;
        const { Address } = Account;
        const ts = trade.Block.allTime;

        return {
          token_id: id,
          trade_price: PriceInUSD,
          buyer_wallet_address: Type === "buy" ? Address : null,
          seller_wallet_address: Type === "sell" ? Address : null,
          created_at: parseDate(ts),
        };
      });
      tokenTrades.push(...trades);
    } catch (error) {
      console.error(`Error fetching data for token ${token}:`, error);
    }
  }

  return tokenTrades;
};

const fetchPumpFunTokenCreatorHoldings = async (data) => {
  const tokenHolders = [];
  try {
    for (const token of data) {
      const { id, creator_address, mint_address } = token;

      const query = JSON.stringify({
        query:
          `query getTokenCreatorHolding($mintAddress: String, $walletAddress: String) {
          Solana {
            BalanceUpdates(
              orderBy: {descendingByField: "TotalHolding"}
              where: {BalanceUpdate: {Currency: {MintAddress: {is: $mintAddress}}, Account: {Owner: {is: $walletAddress}}}}
            ) {
              BalanceUpdate {
                Account {
                  Owner
                }
              }
              TotalHolding: sum(of: BalanceUpdate_Amount, selectWhere: {gt: "0"})
            }
          }
        }`,
        variables: {
          walletAddress: creator_address,
          $mintAddress: mint_address,
        },
      });

      const result = await fetchBitQueryData(query);

      if (result.data.Solana.BalanceUpdates.length == 0) {
        continue;
      }

      const holdings = result.data.Solana.BalanceUpdates[0].TotalHolding;
      tokenHolders.push({
        token_id: id,
        wallet_address: creator_address,
        holdings: holdings,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  } catch (error) {
    console.error(`Error fetching data for token: `, error);
  }

  return tokenHolders;
};

const fillTokens = async (supabase: SupabaseClient) => {
  const tokens = await fetchTopPumpFunTokens();
  console.log("Fetched tokens: ", tokens);
  const { data, error } = await supabase
    .from("tokens")
    .upsert(tokens, {
      onConflict: ["chain_id", "mint_address"],
    })
    .select("id, chain_id, price, mint_address");

  if (error) {
    console.error("Error upserting tokens:", error);
    return false;
  }

  console.log("Upserted tokens: ", data);
  return true;
};

const fillTokenTrades = async (supabase: SupabaseClient) => {
  const { data: currentTokens, error: tokenFetchError } = await supabase
    .from("tokens")
    .select("id, mint_address");

  if (tokenFetchError) {
    console.error("Error fetching tokens:", tokenFetchError);
    return false;
  }

  const { startDate, endDate } = getDateRange();

  const tokenTrades = await fetchPumpFunTokenTrades(
    currentTokens,
    startDate,
    endDate,
  );
  const { data: tokenTradesUpsertData, error: tokenTradesUpsertError } =
    await supabase
      .from("token_trades")
      .upsert(tokenTrades, {
        onConflict: [
          "token_id",
          "buyer_wallet_address",
          "seller_wallet_address",
          "trade_price",
          "created_at",
        ],
      })
      .select("token_id, trade_price, created_at");
  if (tokenTradesUpsertError) {
    console.error("Error upserting token trades:", tokenTradesUpsertError);
    return false;
  }

  console.log(
    `Upserted token trades between ${startDate} and ${endDate}`,
  );
  return true;
};

const fillTokenCreators = async (supabase: SupabaseClient) => {
  const { data: currentTokens, error: tokenFetchError } = await supabase
    .from("tokens")
    .select("id, creator_address, mint_address");

  if (tokenFetchError) {
    console.error("Error fetching tokens:", tokenFetchError);
    return false;
  }

  const tokenCreators = await fetchPumpFunTokenCreatorHoldings(currentTokens);

  const { data: tokenCreatorsUpsertData, error: tokenCreatorsUpsertError } =
    await supabase
      .from("token_creators")
      .upsert(tokenCreators, {
        onConflict: ["token_id", "wallet_address"],
      })
      .select("token_id, holdings, updated_at");

  if (tokenCreatorsUpsertError) {
    console.error("Error upserting token holders: ", tokenCreatorsUpsertError);
    return false;
  }

  console.log("Upserted token creators!");
  return true;
};

export { fillTokenCreators, fillTokens, fillTokenTrades };
