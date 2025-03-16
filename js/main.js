// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const downloadArea = document.getElementById('downloadArea');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadButton = document.getElementById('downloadButton');

// 当前处理的图片数据
let currentFile = null;

// 绑定拖放事件
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// 点击上传
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// 处理上传的文件
function handleFile(file) {
    if (!file.type.match(/image\/(jpeg|png)/)) {
        alert('请上传 JPG 或 PNG 格式的图片！');
        return;
    }

    currentFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
        previewArea.style.display = 'grid';
        downloadArea.style.display = 'block';
        compressImage(e.target.result, qualitySlider.value);
    };

    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(src, quality) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 保持原始宽高比
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 压缩图片
        const compressedDataUrl = canvas.toDataURL(currentFile.type, quality / 100);
        compressedImage.src = compressedDataUrl;

        // 计算压缩后的大小
        const compressedSize = Math.round((compressedDataUrl.length - 22) * 3 / 4);
        document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
    };
    img.src = src;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 监听质量滑块变化
qualitySlider.addEventListener('input', (e) => {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    if (currentFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            compressImage(e.target.result, quality);
        };
        reader.readAsDataURL(currentFile);
    }
});

// 下载压缩后的图片
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedImage.src;
    link.click();
}); 