# NoRugz: AI-Powered Memecoin Launch & Shill Platform

Welcome to **NoRugz**, the cutting-edge AI platform designed to revolutionize memecoin creation and promotion. Our platform seamlessly integrates with **X (formerly Twitter) and Discord** to empower users with advanced AI-driven tools for **token deployment and marketing**.

## 🚀 What You Can Do on NoRugz

### On X (Twitter)
- **Launch Tokens via Tweets**  
  Tag our LLM in your tweet, and it will deploy a token based on the parameters derived from your message.
- **Create Promotional Posts**  
  Our LLM can generate engaging, attention-grabbing promotion posts for your tokens to ensure maximum visibility.

### On Discord
- **Launch Tokens via Mentions**  
  Mention our LLM in a Discord chat, and it will handle the token deployment process based on your instructions.
- **Anti-Rug Check**  
  Users can mention our bot with a token contract address to analyze its security, detecting potential **rug pull risks** before investing.

---

## 🧠 How NoRugz Uses ZerePy  

NoRugz is built on **ZerePy**, an advanced AI agent framework. We've reengineered ZerePy to align with the **ReAct framework** (Reasoning + Acting), enhancing its ability to make context-aware decisions for token-related tasks.

### 🔹 Key Enhancements to ZerePy  

#### **1️⃣ ReAct-Based Agent Loop**  
Traditional agent loops rely on random actions. We’ve redesigned ZerePy to:  
✅ Suggest a structured list of actions for each problem.  
✅ Analyze the scenario and determine the optimal sequence of actions.  

For example:  
- **Promotional Post Creation**: The agent fetches token data via APIs, interacts with X endpoints, and autonomously generates compelling tweets.  
- **Token Deployment**: The agent analyzes tagged tweets, extracts parameters, and formats them into a structured output for deployment via a smart contract.  

#### **2️⃣ Extending Functionality Across Platforms**  
Beyond X, our agents are equipped to perform similar operations on **Discord**, ensuring flexibility and cross-platform compatibility.  

#### **3️⃣ Enhanced LLM Prompting**  
We’ve reimplemented ZerePy’s LLM prompting to:  
- Adhere to **OpenAI's chat completion and structured output generation standards**.  
- Ensure compatibility with a wide range of LLMs, enabling future experimentation with different models.  

## Anti-Rug Protection: AI-Powered Security for Safer Investments  

At **NoRugz**, we leverage a combination of **Machine Learning (ML) models** and **Large Language Models (LLMs)** to analyze smart contracts and detect potential rug-pull risks in real time. Our dual-layer security approach ensures a safer memecoin ecosystem by providing:  

- **Smart Contract Risk Analysis** – Our ML models scan contract bytecode and transaction history, identifying suspicious patterns such as hidden minting functions, high tax fees, ownership renouncement status, and potential honeypots.  
- **LLM-Based Code Review** – Our AI agent, powered by state-of-the-art LLMs, performs an in-depth semantic analysis of Solidity contracts, identifying deceptive practices like proxy contract exploits, unrestricted privilege functions, and backdoor vulnerabilities.  
- **On-Chain & Off-Chain Behavior Analysis** – We aggregate and analyze blockchain activity alongside social sentiment to detect anomalies, such as sudden liquidity withdrawals, token dumps by insiders, or misleading promotional strategies.  

By combining **ML’s pattern recognition** with **LLM’s contextual understanding**, NoRugz delivers **accurate, real-time insights** into token security, empowering users to make **informed** investment decisions.  

Just mention our bot on **Discord** with a token contract address, and our AI will handle the rest! 🚀  

---

## 🎯 Why Choose NoRugz?
✅ **AI-Driven Efficiency** – Save time with automated token launches and promotional content creation.  
✅ **Cross-Platform Support** – Seamlessly integrate memecoin activities on X and Discord.  
✅ **Advanced AI Framework** – Powered by a reimagined **ZerePy** for smarter decision-making and wider model compatibility.  
✅ **Built-in Anti-Rug Check** – Ensure token security before investing.  

---

Join **NoRugz** today and bring your memecoin dreams to life—**no rugs, just gains!** 🚀  

# 🛠️ How to Run NoRugz

NoRugz consists of a Next.js frontend and a ZerePy backend (Python). Follow these steps to set up and run the project locally:

## 1️⃣ Clone the Repository

```sh
git clone https://github.com/vonhatnam1212/NoRugz.git
cd NoRugz
```

## 2️⃣ Set Up the Backend (ZerePy)

### Install Dependencies

```sh
cd ZerePy
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install poetry
poetry install --no-root
```

### Configure Environment Variables

Create a `.env` file in the backend directory using the provided `.env.sample` file:

```sh
cp .env.sample .env
```

Edit `.env` with your actual API keys and configuration:

```env
OPENAI_API_KEY=your_openai_api_key
DISCORD_BOT_TOKEN=your_discord_bot_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
```

### Start the Backend Server

```sh
python main.py
```

# CLI Commands Help

Use the `help` command in the CLI to see all available commands. Below is a list of key commands and their descriptions.

## Agent Management

- **`list-agents`**  
  Show available agents.

- **`load-agent <agent_name>`**  
  Load a specific agent.

- **`agent-loop`**  
  Start autonomous behavior of the loaded agent.

- **`agent-action <action>`**  
  Execute a single action using the agent.

## Connection Management

- **`list-connections`**  
  Show available connections.

- **`configure-connection <connection_name>`**  
  Set up a new connection.

## Actions

- **`list-actions <connection_name>`**  
  Show available actions for a specific connection.

## Interaction

- **`chat`**  
  Start an interactive chat with the loaded agent.

- **`clear`**  
  Clear the terminal screen.

## 3️⃣ Set Up the Frontend (Next.js)

### Install Dependencies

```sh
cd ../frontend
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the frontend directory using `.env.sample`:

```sh
cp .env.sample .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Start the Frontend Server

```sh
npm run dev
```

## 4️⃣ Access the Application

Once both servers are running:

- **Frontend:** Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API:** Access API docs at [http://localhost:8000/docs](http://localhost:8000/docs) if Swagger is enabled.


Link discord: https://discord.gg/SdBXscHm
