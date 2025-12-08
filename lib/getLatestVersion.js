import axios from "axios";

async function getLatestVersion() {
    try {
        // Point to your repository's database.js file
        const url = "https://raw.githubusercontent.com/private-254/dem/main/lib/database.js";
        const res = await axios.get(url);
        
        // Extract version string from the settings
        const match = res.data.match(/version:\s*["'`](.*?)["'`]/);
        return match ? match[1] : null;
    } catch (err) {
        console.error("Failed to fetch latest version:", err.message);
        return null;
    }
}

export { getLatestVersion };