# n8n-nodes-autopost

An [n8n](https://n8n.io/) community node for **[AutoPost TheNextGen](https://autopost.thenextgen.ai)** — the all-in-one social media scheduling and inbox management platform.

## Features

- **Schedule posts** across Facebook, Instagram, LinkedIn, TikTok, and Twitter/X
- **Manage your inbox** — read and reply to DMs and comments
- **List connected accounts** to drive dynamic workflows

---

## Installation

### In n8n (recommended)

1. Open your n8n instance.
2. Go to **Settings → Community Nodes**.
3. Click **Install a community node**.
4. Enter `n8n-nodes-autopost` and click **Install**.

### Manual (self-hosted)

```bash
cd /path/to/your/n8n/data
npm install n8n-nodes-autopost
```

Then restart n8n.

---

## Setup

### 1. Get your API Key

1. Log in to [autopost.thenextgen.ai](https://autopost.thenextgen.ai).
2. Navigate to **Settings → API**.
3. Copy your API key (it starts with `up_`).

### 2. Add credentials in n8n

1. In n8n, open **Credentials → New**.
2. Search for **AutoPost API**.
3. Paste your **API Key**.
4. Leave **Base URL** as `https://autopost.thenextgen.ai` (or change it if self-hosting).
5. Click **Save**.

---

## Resources & Operations

### Posts

| Operation | Description |
|-----------|-------------|
| **Create** | Schedule a post with content, platforms, optional scheduled time, and image URL |
| **Get All** | Retrieve posts with optional filters: `status`, `limit`, `page` |
| **Delete** | Delete a post by ID |

**Create Post fields:**
- `content` — post text (required)
- `platforms` — one or more of: `facebook`, `instagram`, `linkedin`, `tiktok`, `twitter`
- `scheduled_at` — ISO 8601 datetime (leave empty to publish immediately)
- `image_url` — optional public image URL

---

### Messages (DMs)

| Operation | Description |
|-----------|-------------|
| **Get All** | List messages filtered by `platform`, `is_read`, `limit` |
| **Reply** | Reply to a message by ID |
| **Mark as Read** | Mark all messages from a `sender_id` + `platform` as read |

---

### Comments

| Operation | Description |
|-----------|-------------|
| **Get All** | List comments filtered by `platform`, `is_read`, `limit` |
| **Reply** | Reply to a comment by ID |

---

### Accounts

| Operation | Description |
|-----------|-------------|
| **Get All** | List all connected social media accounts |

---

## Example Workflows

### Auto-reply to unread Instagram DMs

1. **Schedule Trigger** — runs every 15 minutes
2. **AutoPost → Messages → Get All** — filter: `platform=instagram`, `is_read=false`
3. **IF** — check message content for keywords
4. **AutoPost → Messages → Reply** — send automated response

---

### Publish content from Google Sheets

1. **Google Sheets → Read Rows** — read scheduled content
2. **AutoPost → Posts → Create** — pass content, platforms, and scheduled_at from the sheet
3. **Google Sheets → Update Row** — mark the row as published

---

### Notify Slack when new comments arrive

1. **Schedule Trigger** — runs every 5 minutes
2. **AutoPost → Comments → Get All** — filter: `is_read=false`, `limit=10`
3. **IF** — items exist
4. **Slack → Send Message** — post a summary to your team channel
5. **AutoPost → Comments → Reply** — optional: send an auto-acknowledgement

---

## GitHub Repository

[https://github.com/UbaiSalih/n8n-nodes-autopost](https://github.com/UbaiSalih/n8n-nodes-autopost)

To publish as a separate package, initialize a new git repo inside this folder:

```bash
cd n8n-nodes-autopost
git init
git add .
git commit -m "feat: initial release of n8n-nodes-autopost v0.1.0"
git remote add origin https://github.com/UbaiSalih/n8n-nodes-autopost.git
git push -u origin main
```

Then publish to npm:

```bash
npm login
npm publish --access public
```

---

## API Reference

Full API documentation is available at [autopost.thenextgen.ai/docs/api](https://autopost.thenextgen.ai/docs/api).

---

## License

MIT © [The Next Gen](https://thenextgen.ai)
