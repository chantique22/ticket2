
import "dotenv/config";
import { authOptions } from "../lib/auth"; // Adjust path if needed

async function main() {
    console.log("Simulating Login...");
    
    // Extract the authorize function manually since authOptions.providers is an array
    const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials' || p.name === 'Credentials') as any;
    
    if (!credentialProvider) {
        console.error("Credentials provider not found in authOptions");
        return;
    }

    const credentials = {
        username: "admin",
        password: "password123"
    };

    try {
        console.log("Calling authorize with:", credentials);
        const authorize = credentialProvider?.options?.authorize;
        if (typeof authorize !== "function") {
            console.error("Authorize function not found on credentials provider shape:", Object.keys(credentialProvider || {}));
            return;
        }

        const user = await authorize(credentials, {});
        console.log("Authorize Result:", user);
    } catch (e) {
        console.error("Authorize failed:", e);
    }
}

main();
