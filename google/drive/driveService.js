const { google } = require('googleapis');
const stream = require('stream');

// --- CONFIGURATION --- //
let driveConfig = {};
let drive = null;

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const folderCache = {}; 


// Function to get Financial year
function getFinancialYear() {

    const today = new Date();
    // const today = new Date("2030-03-31");

    const year = today.getFullYear();   
    const month = today.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}


// Function to get ClientId, ClientSecret and RefreshToken object
function initialize(config) {

    driveConfig = config;

    const oauth2Client = new google.auth.OAuth2(
        driveConfig.clientId,
        driveConfig.clientSecret,
        REDIRECT_URI
    );


    oauth2Client.setCredentials({
        refresh_token: driveConfig.refreshToken
    });

    drive = google.drive({
        version: "v3",
        auth: oauth2Client
    });


}
/**
 * 1. Find or Create Folder
 */
async function findOrCreateFolder(folderName, parentFolderId = driveConfig.rootFolderId) {

    const cacheKey = `${parentFolderId}_${folderName}`;
    if (folderCache[cacheKey]){
         return folderCache[cacheKey];
    }

    try {

        // console.log(`Checking folder: ${folderName}...`);
        const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false and '${parentFolderId}' in parents`;
        
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (res.data.files.length > 0) {
            const existingId = res.data.files[0].id; 
            folderCache[cacheKey] = existingId;
            return existingId;
        }

        // console.log(`Creating folder: ${folderName}...`);
        const newFolder = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId]
            },
            fields: 'id'
        });


        const newId = newFolder.data.id;
        folderCache[cacheKey] = newId;
        return newId;

    } catch (error) {
        // console.error("Folder Error:", error.message);
        throw error;
    }
}

/**
 * 2. Upload or Update File 
 */
async function uploadToDrive(fileName, fileBuffer, mimeType, folderType) {

    try {

        const targetFolderName = folderType || "General_Uploads";
        const financialYear = getFinancialYear();
        const financialYearFolderId = await findOrCreateFolder(financialYear);
        const categoryFolderId = await findOrCreateFolder(targetFolderName,financialYearFolderId);

        // console.log(`Preparing to upload '${fileName}' to '${targetFolderName}'...`);

        // --- STEP A: Check if File Exists ---
        const query = `name='${fileName}' and '${categoryFolderId}' in parents and trashed=false`;
        const existingFiles = await drive.files.list({
            q: query,
            fields: 'files(id, name, webViewLink, webContentLink)',
            spaces: 'drive'
        });

        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        let response;

        // --- STEP B: Logic Decision ---
        if (existingFiles.data.files.length > 0) {
            // CASE 1: FILE EXISTS -> UPDATE IT
            const fileId = existingFiles.data.files[0].id;
            // console.log(`File exists (${fileId}). Updating content...`);

            response = await drive.files.update({
                fileId: fileId,
                media: {
                    mimeType: mimeType,
                    body: bufferStream,
                },
                fields: 'id, name, webViewLink, webContentLink',
            });
            // console.log('Update Success!');

        } else {
            // CASE 2: FILE DOES NOT EXIST -> CREATE NEW
            console.log(`File not found. Creating new...`);
            
            response = await drive.files.create({
                requestBody: {
                    name: fileName,
                    parents: [categoryFolderId],
                },
                media: {
                    mimeType: mimeType,
                    body: bufferStream,
                },
                fields: 'id, name, webViewLink, webContentLink',
            });
            // console.log('Create Success!');
        }

        return response.data;

    } catch (error) {
        console.error('Drive Upload Error:', error.message);
        throw error;
    }
}

/**
 * 3. Get Buffer
 */
async function getFileBuffer(fileId) {
    try {
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );
        return Buffer.from(response.data);
    } catch (error) {
        // console.error('Buffer Fetch Error:', error.message);
        throw error;
    }
}

module.exports = { initialize, uploadToDrive, getFileBuffer };