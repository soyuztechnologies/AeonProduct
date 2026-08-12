const { google } = require('googleapis');
const stream = require('stream');

// --- CONFIGURATION --- //
let driveConfig = {};
let drive = null;

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const folderCache = {}; 
const folderCreationPromises = {};


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

    // If another request is already checking/creating this folder,
    // wait for that request instead of creating another folder.
    if (folderCreationPromises[cacheKey]) {
        return await folderCreationPromises[cacheKey];
    }

    // Start one single operation for this folder.
    folderCreationPromises[cacheKey] = (async function () {

        // 1. Check cached folder
        if (folderCache[cacheKey]) {
            try {
                const cachedFolder = await drive.files.get({
                    fileId: folderCache[cacheKey],
                    fields: 'id, name, mimeType, trashed, parents'
                });

                if (
                    cachedFolder.data.name === folderName &&
                    cachedFolder.data.mimeType === 'application/vnd.google-apps.folder' &&
                    cachedFolder.data.trashed === false &&
                    cachedFolder.data.parents &&
                    cachedFolder.data.parents.includes(parentFolderId)
                ) {
                    return cachedFolder.data.id;
                }

                // Cached ID is no longer valid
                delete folderCache[cacheKey];

            } catch (error) {
                // Folder was deleted or is no longer accessible
                console.log(`Cached folder not found: ${folderName}`);
                delete folderCache[cacheKey];
            }
        }

        // 2. Search folder in Google Drive
        const query =
            `mimeType='application/vnd.google-apps.folder' ` +
            `and name='${folderName}' ` +
            `and trashed=false ` +
            `and '${parentFolderId}' in parents`;

        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name, mimeType, parents)',
            spaces: 'drive'
        });

        // 3. Folder already exists
        if (res.data.files && res.data.files.length > 0) {

            const existingId = res.data.files[0].id;

            folderCache[cacheKey] = existingId;

            return existingId;
        }

        // 4. Folder doesn't exist → create ONE
        console.log(`Creating folder: ${folderName}`);

        const newFolder = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId]
            },
            fields: 'id, name'
        });

        const newId = newFolder.data.id;

        // 5. Store newly created folder
        folderCache[cacheKey] = newId;

        return newId;

    })();

    try {

        return await folderCreationPromises[cacheKey];

    } finally {

        // Remove lock after operation is complete.
        // The actual folder ID remains in folderCache.
        delete folderCreationPromises[cacheKey];

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