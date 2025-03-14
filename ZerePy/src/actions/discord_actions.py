from src.action_handler import register_action
from src.helpers import print_h_bar
import os
from dotenv import load_dotenv
import json
import requests
load_dotenv()

DEPLOY_TOKEN_URL = os.getenv("DEPLOY_TOKEN_URL")


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
def rug_detect(agent, **kwargs):
    # Pull token holders data
    # Pull transactions data
    # Pull token analytics

    data = {}
    # system prompt