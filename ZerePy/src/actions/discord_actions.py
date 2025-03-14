from src.action_handler import register_action
from src.helpers import print_h_bar
import os
from dotenv import load_dotenv
import json
import requests
from moralis import evm_api

load_dotenv()

DEPLOY_TOKEN_URL = os.getenv("DEPLOY_TOKEN_URL")
SYSTEM_PROMPT = """You are an expert in analyzing Sonic Protocol tokens and smart contracts for potential rug pulls and security risks.
    Your task is to provide a comprehensive security analysis of tokens, focusing on these key areas:

    1. Token Distribution Analysis:
       - Analyze the top holder concentration and distribution patterns
       - Identify suspicious wallet patterns or centralization risks
       - Calculate and evaluate the Gini coefficient of token distribution
       - Flag any concerning ownership patterns

    2. Transaction Pattern Analysis:
       - Evaluate recent transaction volumes and frequencies
       - Identify suspicious trading patterns or market manipulation
       - Analyze transaction sizes and timing
       - Look for wash trading or artificial volume
       - Check for large dumps or suspicious transfers

    3. Smart Contract Security:
       - Evaluate contract ownership and admin privileges
       - Check for minting capabilities and supply control
       - Identify potential backdoors or high-risk functions
       - Assess contract upgradeability and its implications
       - Review token standard compliance

    4. Market and Community Analysis:
       - Social media presence and community engagement
       - Development activity and team transparency
       - Token utility and use cases
       - Integration with DeFi protocols or other contracts

    5. Risk Assessment:
       - Provide detailed risk factors with severity levels
       - Identify potential red flags and warning signs
       - Calculate risk metrics across different dimensions
       - Compare against known rug pull patterns

    6. Recommendations:
       - Specific actions for risk mitigation
       - Due diligence checklist for investors
       - Security best practices
       - Monitoring suggestions

    Provide a detailed markdown report with clear sections and evidence-based analysis. Use tables and lists for better readability.
    End with a comprehensive risk score (1-100) where:
    - 80-100: Very Safe (Well-audited, transparent, good distribution)
    - 60-79: Generally Safe (Some minor concerns)
    - 40-59: Moderate Risk (Notable concerns present)
    - 20-39: High Risk (Multiple red flags)
    - 0-19: Extreme Risk (Strong rug pull indicators)"""

USER_PROMPT = """Analyze this Sonic token for rug pull risks and security concerns. Here's the data:
        {data}

        Provide a comprehensive markdown report with these sections:

        # Token Analysis Report

        ## 1. Token Overview
        - Basic token information
        - Contract details
        - Market data and statistics

        ## 2. Holder Analysis
        - Top holder concentration
        - Distribution metrics
        - Wallet patterns
        - Gini coefficient calculation

        ## 3. Transaction Analysis
        - Recent transaction patterns
        - Volume analysis
        - Suspicious activity detection
        - Large transfers investigation

        ## 4. Smart Contract Security
        - Contract features
        - Admin privileges
        - Minting capabilities
        - Security risks

        ## 5. Risk Assessment
        - Detailed risk factors
        - Red flags
        - Security concerns
        - Comparison with known rug pulls

        ## 6. Market & Community
        - Social presence
        - Development activity
        - Token utility
        - Integration analysis

        ## 7. Recommendations
        - Risk mitigation steps
        - Due diligence checklist
        - Security best practices
        - Monitoring suggestions

        ## 8. Final Verdict
        Summarize the analysis and provide clear recommendations.

        End your analysis with a risk score in this format:
        <SCORE>XX</SCORE>
        where XX is a number from 0-100 (higher = safer)."""


@register_action("list-channels")
def list_channels(agent, **kwargs) -> dict:
    list_channels = agent.connection_manager.perform_action(
        connection_name="discord",
        action_name="list-channels",
        params=[]
    )

    return list_channels


@register_action("read-mentioned-messages")
def read_mentioned_messages(agent, **kwargs) -> list:
    list_channels = agent.connection_manager.perform_action(
        connection_name="discord",
        action_name="list-channels",
        params=[]
    )
    agent.logger.info(list_channels)
    list_messages = []
    for channel in list_channels:
        mentioned_messages = agent.connection_manager.perform_action(
            connection_name="discord",
            action_name="read-mentioned-messages",
            params=[channel["id"], 1]
        )
        agent.logger.info(mentioned_messages)
        if mentioned_messages:
            list_messages.append(mentioned_messages[0])
    return list_messages


@register_action("deploy-token-discord")
def deploy_token_discord(agent, **kwargs):
    agent.logger.info("\n📝 Deploying token with discord")
    print_h_bar()
    url = f"{DEPLOY_TOKEN_URL}api/memecoin/create-for-user"

    messages = read_mentioned_messages(agent, **kwargs)

    responses = []
    for message in messages:
        agent.logger.info(message)
        data = {
            "isTwitter": True,
            "twitterHandle": message.get('mentions')[0].get("username"),
            "input": message.get('message'),
        }
        agent.logger.info(data)
        response = requests.post(url, json=data)
        agent.logger.info(f"\n✅ Deploy token successfully! with {response.json()}")

        # Generate natural language reponse given the json data
        llm_message = agent.prompt_llm(prompt="Generate a message discord given the response",
                                       system_prompt=json.dumps(response.json()))
        agent.logger.info(f"\n📝 Generated response: {llm_message}")
        responses.append({
            "message_id": message.get("id"),
            "channel_id": message.get('channel_id'),
            "response": llm_message
        })

    # json response -> reply to tweet
    for response in responses:
        message_id = response['message_id']
        channel_id = response['channel_id']
        reply_text = response['response']

        agent.connection_manager.perform_action(
            connection_name="discord",
            action_name="reply-to-message",
            params=[channel_id, message_id, reply_text]
        )
        agent.logger.info(f"\n🚀 Posting reply: '{reply_text}'")
    return


@register_action("rug-detect")
def rug_detect(agent, address, **kwargs):
    def get_token_owners():
        result = evm_api.token.get_token_owners(
          api_key=os.getenv("MORALIS_API_KEY"),
          params={
            "chain": "fantom",
            "order": "DESC",
            "token_address": address
          },
        )
        data = result["result"][:10]
        return map(lambda x: {"address": x["owner_address"], "balance": x["balance_formatted"], "percentage_owned_to_total_supply": x["percentage_relative_to_total_supply"]}, data)

    def get_token_transfers():
        result = evm_api.token.get_token_transfers(
          api_key=os.getenv("MORALIS_API_KEY"),
          params={
            "chain": "fantom",
            "order": "DESC",
            "address": address
          },
        )
        data = result["result"][:10]
        return map(lambda x: {"from": x["from_address"], "to": x["to_address"], "value": x["value_decimal"], "block_timestamp": x["block_timestamp"]}, data)

    def get_token_metadata():
        params = {
            "chain": "fantom",
            "addresses": [address]
        }

        result = evm_api.token.get_token_metadata(
        api_key=os.getenv("MORALIS_API_KEY"),
        params=params,
        )
        return result[0]

    data = {
        "holders": list(get_token_owners()),
        "transactions": list(get_token_transfers()),
        "token_info": get_token_metadata()
    }

    return data
    # system prompt


    messages = read_mentioned_messages(agent, **kwargs)

    responses = []
    for message in messages:
        agent.logger.info(message)
        if "check anti-rug" in message.get('message'):
            agent.logger.info(USER_PROMPT.format(data=json.dumps(data, indent=2)))
            llm_analysis = agent.prompt_llm(prompt=USER_PROMPT.format(data=json.dumps(data, indent=2)), system_prompt=SYSTEM_PROMPT)
            agent.logger.info(f"\n📝 Generated response: {llm_analysis}")
            agent.logger.info(len(llm_analysis))

            if len(llm_analysis) > 2000:
                llm_summary = agent.prompt_llm(prompt=llm_analysis,
                                                system_prompt="summary response under 300 words")
                responses.append({
                    "message_id": message.get("id"),
                    "channel_id": message.get('channel_id'),
                    "response": llm_summary
                })
            else:
                responses.append({
                    "message_id": message.get("id"),
                    "channel_id": message.get('channel_id'),
                    "response": llm_analysis
                })

    # json response -> reply to tweet
    for response in responses:
        message_id = response['message_id']
        channel_id = response['channel_id']
        reply_text = response['response']

        agent.connection_manager.perform_action(
            connection_name="discord",
            action_name="reply-to-message",
            params=[channel_id, message_id, reply_text]
        )
        agent.logger.info(f"\n🚀 Posting reply successfully! ")

    return