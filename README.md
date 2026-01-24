# 🌊 Maine Lake Guardian

A high-performance dashboard for monitoring lake health within a 50-mile radius of Norway, Maine.

## 🚀 One-Click Setup (Google IDX)
If you are viewing this in **Google IDX**:
1. The environment will automatically run `npm install`.
2. A preview window will appear shortly.
3. To share with others, click the **Firebase** icon in the sidebar and select **Deploy to Hosting**.

## 🛠 Manual Setup
If you downloaded this folder:
1. Open your terminal in this directory.
2. Run `npm install` (this recreates the `node_modules` folder).
3. Run `npm run dev` to start the app.

## 📊 Features
- **Regional Registry**: Pre-loaded data for major lakes (Pennesseewassee, Sebago, Thompson, etc.).
- **AI Ecological Audit**: Powered by Gemini 3 Flash for real-time water quality analysis.
- **Historical Import**: Drag and drop `.xlsx` or `.csv` files to visualize your own monitoring data.
- **Biosecurity Alerts**: Real-time tracking of invasive species detections in the Oxford County region.

## 🔑 Environment Variables
This app requires a `process.env.API_KEY` for the Gemini AI features. In Google IDX, you can set this in the **Secrets Manager**.