var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    use: {
        baseURL: "http://127.0.0.1:5173"
    },
    projects: [
        {
            name: "chromium",
            use: __assign({}, devices["Desktop Chrome"])
        }
    ],
    webServer: {
        command: "cmd /c npm run dev",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: true,
        timeout: 120000
    }
});
