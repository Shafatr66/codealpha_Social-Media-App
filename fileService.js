const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = (file) => {
    const filePath = path.join(uploadDir, file.name);
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        file.stream.pipe(stream);
        stream.on('finish', () => resolve(filePath));
        stream.on('error', (error) => reject(error));
    });
};

const deleteFile = (fileName) => {
    const filePath = path.join(uploadDir, fileName);
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
};

const getFilePath = (fileName) => {
    return path.join(uploadDir, fileName);
};

module.exports = {
    saveFile,
    deleteFile,
    getFilePath,
};