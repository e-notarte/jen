const DRIVE_FOLDER_ID = '16ulzs1irW6tkBVkTsrodvgDYtAe9vbt1';

function doGet() {
  return jsonResponse({
    ok: true,
    message: 'Wedding upload service is ready.'
  });
}

function doPost(request) {
  try {
    const payload = JSON.parse(request.postData.contents);
    const fileName = sanitizeFileName(payload.fileName);
    const mimeType = payload.mimeType || 'application/octet-stream';
    const data = payload.data;

    if (!fileName || !data) {
      throw new Error('Missing file name or file data.');
    }

    const decoded = Utilities.base64Decode(data);
    if (decoded.length > 18 * 1024 * 1024) {
      throw new Error('File exceeds the 18 MB upload limit.');
    }

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = folder.createFile(blob);

    return jsonResponse({
      ok: true,
      fileId: file.getId(),
      fileName: file.getName(),
      url: file.getUrl()
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error && error.message ? error.message : 'Upload failed.'
    });
  }
}

function sanitizeFileName(fileName) {
  if (!fileName) return '';
  return String(fileName)
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
