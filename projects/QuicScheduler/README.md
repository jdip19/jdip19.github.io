# 📅 Social Post Scheduler v3 — Chrome Extension (Sidebar)

No OAuth. No login. Just an API Key.

## 🔑 Get a FREE Google Sheets API Key (2 minutes)

1. Go to: https://console.cloud.google.com/
2. Create a new project (e.g. "Post Scheduler")
3. Go to **APIs & Services → Enable APIs & Services**
4. Search for **Google Sheets API** → Enable it
5. Go to **APIs & Services → Credentials**
6. Click **+ Create Credentials → API Key**
7. Copy the key (starts with `AIzaSy…`)
8. Optional: Click **Restrict Key** → restrict to Google Sheets API only

That's it. No OAuth. No consent screen. No Extension ID needed.

---

## 📋 Make Your Sheet Public (Read Only)

Your sheet must be accessible via API Key:

1. Open your Google Sheet
2. Click **Share** (top right)
3. Change to **Anyone with the link → Viewer**
4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`SHEET_ID_HERE`**`/edit`

---

## 🗂 Sheet Column Names

Row 1 should have these headers (names are flexible):

| Caption | Hashtags | Link | Image Path | Schedule Date | Time |
|---------|----------|------|------------|---------------|------|
| Post text... | #tag1 #tag2 | https://... | D:\Images\photo.jpg | 25/03/2025 | 10:00 AM |

The extension understands variations:
- Caption → `caption`, `text`, `content`
- Hashtags → `hashtags`, `tags`, `hashtag`
- Link → `link`, `url`, `website`, `cta link`
- Image → `image path`, `image filename`, `image`, `photo`
- Date → `schedule date`, `date`, `scheduled date`
- Time → `time`, `schedule time`, `post time`

---

## 🚀 Install Extension

1. Open Chrome → `chrome://extensions/`
2. Turn on **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `scheduler-v3` folder
5. Pin the extension to toolbar

---

## ▶️ How to Use

1. Open your social media scheduling tool in Chrome
2. Click the 📅 extension icon → sidebar opens on the right
3. Go to **⚙️ Settings** tab
4. Paste your **API Key**, **Sheet ID**, and **Tab name**
5. Click **Connect & Load Sheet**
6. Switch to **📋 Posts** tab
7. Click **⚡ Fill This Post**
8. Caption, hashtags, link, date & time are auto-filled
9. For image: dialog opens → select the file shown in the notification
10. Click **Schedule** in your tool → come back and hit **Next →**

The sidebar stays open while you work — close it only when done!
