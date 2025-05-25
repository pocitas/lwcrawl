import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url) // Get the current file path
const __dirname = path.dirname(__filename) // Get the directory path

const url = 'https://lxrmsrt-prod.cah.cz/staffcom'
const outputDir = path.join(__dirname, 'cekani')
const waitTime = 5000

// Define your cookies string
const cookiesString = "JSESSIONID=15C7D850707D28B672CD7E789D2F53A5; X-GSSK=2WU72ZvC; AzureAppProxyAnalyticCookie_8ca961c0-2d5f-4470-a4c4-7a0907c26895_https_1.3=MGD:MIIBvwYJKoZIhvcNAQcDoIIBsDCCAawCAQIxggEyooIBLgIBBDCB8QRUTAAAAAAAAAABAAAAS0RTSwYAAABrAQAACQAAABEAAAB7VKEeOYs8RKExRXgD3Wt6IAAAAPozqivQufk9wKtCw+pcoHZdjjg4t+ZAo0wk9r+E8j4UMIGYBgkrBgEEAYI3SgEwgYoGCisGAQQBgjdKAQ0wfDB6MHgMBERTVFMMcGdlcm1hbnl3Yy1ka2RzLmRrZHMuY29yZS53aW5kb3dzLm5ldDtodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lO2N3YXBwcm94eWRrZHNldXIwCwYJYIZIAWUDBAEtBCigv0OJZA8NmITCU9EvDZ4BSwzEBZFrKsJBN8MAVUgsEvLMOCfo4CoCMHEGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMt9cWFbtRWHIsfHe4AgEQgERKEFCWXI2f7gPAAK3c85368NLv9jM+msADP3SSDJpAGWRUyNM5B3E49HgqtMxL6yc/Owg3QVI8+lE6CN7LxBfKs3050w==; OAuth_Token_Request_State=e11aac53-9f49-4c4d-91fa-b0134bd064d2; AzureAppProxyAnalyticCookie_bddad0bf-9e04-49de-bca0-bea788f12e88_https_1.3=MGD:MIIBvwYJKoZIhvcNAQcDoIIBsDCCAawCAQIxggEyooIBLgIBBDCB8QRUTAAAAAAAAAABAAAAS0RTSwYAAABrAQAACQAAABEAAAB7VKEeOYs8RKExRXgD3Wt6IAAAAF1tLfbVWcv1qrxWsOyc0Xy6tIR08loFqk6dQVYneAxxMIGYBgkrBgEEAYI3SgEwgYoGCisGAQQBgjdKAQ0wfDB6MHgMBERTVFMMcGdlcm1hbnl3Yy1ka2RzLmRrZHMuY29yZS53aW5kb3dzLm5ldDtodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lO2N3YXBwcm94eWRrZHNldXIwCwYJYIZIAWUDBAEtBCj9Rt0NPHyA3/zT1aw6aVw91kYUhmVkDGYMg+v6NEI68OvIRbVNymhcMHEGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMn5VVRcEttQMXOTQxAgEQgES5zhcZ2NWC+9oPcmYGkZzsrUv8De2RHDz2ArHlhH2N1f4RgQoAfqEnJJKmePGRGPIZnzrezFYKnRCnjQg9r4MOhLQSNQ==; AzureAppProxyAccessCookie_bddad0bf-9e04-49de-bca0-bea788f12e88_1.3=MGD:MIICrwYJKoZIhvcNAQcDoIICoDCCApwCAQIxggEyooIBLgIBBDCB8QRUTAAAAAAAAAABAAAAS0RTSwYAAABrAQAACQAAABEAAAB7VKEeOYs8RKExRXgD3Wt6IAAAAOyQTWLjtQHaXqNjRyQWAQW8PTgQ34+Bm3El+TeoiYgVMIGYBgkrBgEEAYI3SgEwgYoGCisGAQQBgjdKAQ0wfDB6MHgMBERTVFMMcGdlcm1hbnl3Yy1ka2RzLmRrZHMuY29yZS53aW5kb3dzLm5ldDtodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lO2N3YXBwcm94eWRrZHNldXIwCwYJYIZIAWUDBAEtBChM2NS+YrV2pGlHk8wNGW1vIEHc5ZQg76UppR1gJSoYZtDFmSWzF7ImMIIBXwYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAwzjoowKiWg/wXiyiYCARCAggEwT9BHBq4mjX5+AHKpPsgNhj48hDB11Seca+tqQDKx43MDDtapalZDVk/kcIhXprrU8KHH/S8wWVVzm2l85CDWOYNs6zotblueKPfSZIfJIJ/IrEad+GJ3rWvIZjYVBZL7Uoxk5Qal7VAYW3rKyaMVVEFR+I3/xJO4EUDonuWTyRbEZY71uEsUoPE2pKS+5DyfmZ8OXs/70wnj/QIU9umd1G+0QRvDa7y1Lf/gp6CWUo9tMviYR+nmJvEtve5OJtMXXG/Ts/66CK+h8Y4RRosbbEAYFWXxYFsVVR1PG5Qhke8XGEXGjifiu1iJtX43TGH0hfYmiAQFh/hLrcf3ShF2HWmP8svDYrljEFxyYtyMERiMdHn93lsCxfLg4ID2sXR/lY2J1EBBwD34L23WHh+2HA==; ice.push.browser=4mb3kl3fq; AzureAppProxyAccessCookie_8ca961c0-2d5f-4470-a4c4-7a0907c26895_1.3=MGD:MIICrwYJKoZIhvcNAQcDoIICoDCCApwCAQIxggEyooIBLgIBBDCB8QRUTAAAAAAAAAABAAAAS0RTSwYAAABrAQAACQAAABEAAAB7VKEeOYs8RKExRXgD3Wt6IAAAAHVNaUHmu/oFlbr05QImsBva9Pt+3JTzPg7lcgjnKcFjMIGYBgkrBgEEAYI3SgEwgYoGCisGAQQBgjdKAQ0wfDB6MHgMBERTVFMMcGdlcm1hbnl3Yy1ka2RzLmRrZHMuY29yZS53aW5kb3dzLm5ldDtodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lO2N3YXBwcm94eWRrZHNldXIwCwYJYIZIAWUDBAEtBCjBADoTB6swbnjjLm9GBFuIl+DNcbsgcp1phrX8V+pLJ62YiihlWcA5MIIBXwYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAxjZQ+dr2Sb60fk/SUCARCAggEwa2GnX3eFPbTu9h09KqPR+nQ+H4thgmZvNepXb7GxxD57FDdugmbyitTyUYKVlghBpk0Hu17GBSZKxraaljWsWuOuF33otZC4pWAGTM74WBPeL2FlxymCx/xDb1vKYY0xzT9sLrZuNYjelIJQKZR6gwLGTWwIDX+Z0/xhbIEYDg+vWvael4pc1Rj3SB3cpvhcDdzuDEQaQL/l3zjBNpjo/lb2aVHNrlFpAuFDx51H9P5dO2jfW+2mpRzBh6G5nCZcPjK0NNkRov33iSGX7gUkq5zPy/r3IH1hnt271hWx2vgegf28uaZ3fZo+JuDZy0ua6r5qbhrymwxL5acUtsoJeqWbyALdv8/qfY9E9QhJkrK7BiHED6k0q9Xw+bzHuDG1loKNPnpXz50b/0lQ/95atg=="

async function downloadWebpage(url: string, outputDir: string, waitTime: number = 5000) {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
			headless: false,
			args: ['--ignore-certificate-errors']
    })
    
    try {
        const page = await browser.newPage()

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2' })

				#tilesHolder > div.tile-container > div > div.table
        // Wait for the page to load dynamically
        await new Promise(res => setTimeout(res, waitTime))

        // Check the page title to verify if login was successful
        const pageTitle = await page.title()
        console.log('Page title:', pageTitle) // Debugging log

        // Remove all scripts from the page
        await page.evaluate(() => {
            const scripts = document.querySelectorAll('script')
            scripts.forEach(script => script.remove())
        })

        // Get the page content
        const htmlContent = await page.content()

        // Create the output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }

        // Save the HTML file
        const htmlFilePath = path.join(outputDir, 'index.html')
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8')
        console.log(`HTML saved to ${htmlFilePath}`)

        // Download assets (CSS, images, etc.)
        const assets = await page.evaluate(() => {
            const assetUrls: string[] = []
            const elements = document.querySelectorAll('link[rel="stylesheet"], img')
            elements.forEach(el => {
                if (el.tagName === 'LINK' && el.getAttribute('rel') === 'stylesheet') {
                    assetUrls.push((el as HTMLLinkElement).href)
                } else if (el.tagName === 'IMG') {
                    assetUrls.push((el as HTMLImageElement).src)
                }
            })
            return assetUrls
        })

        // Configure Axios to include cookies and ignore SSL certificate errors
        const axiosInstance = axios.create({
            headers: {
                Cookie: cookiesString
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // Ignore SSL certificate errors
            })
        })

        for (const assetUrl of assets) {
            try {
                const assetResponse = await axiosInstance.get(assetUrl, { responseType: 'arraybuffer' })
                const assetPath = new URL(assetUrl).pathname
                const assetFilePath = path.join(outputDir, assetPath)

                // Ensure the directory exists
                const assetDir = path.dirname(assetFilePath)
                if (!fs.existsSync(assetDir)) {
                    fs.mkdirSync(assetDir, { recursive: true })
                }

                // Save the asset
                fs.writeFileSync(assetFilePath, assetResponse.data)
                console.log(`Asset saved to ${assetFilePath}`)
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Failed to download asset: ${assetUrl}`, error.message)
                } else {
                    console.error(`Failed to download asset: ${assetUrl}`, String(error))
                }
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error downloading webpage:', error.message)
        } else {
            console.error('Error downloading webpage:', String(error))
        }
    } finally {
        // Close the browser context
        await browser.close()
    }
}

downloadWebpage(url, outputDir, waitTime)