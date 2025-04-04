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
let originalImageData = null; // 存储原始图片数据

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
    originalSize.textContent = formatFileSize(file.size);
    
    // 使用 URL.createObjectURL 而不是 FileReader 来提高性能
    const objectUrl = URL.createObjectURL(file);
    originalImageData = objectUrl;
    originalImage.src = objectUrl;
    
    previewArea.style.display = 'grid';
    downloadArea.style.display = 'block';
    
    // 压缩图片，使用当前滑块值
    compressImage(objectUrl, qualitySlider.value);
}

// 压缩图片
function compressImage(src, quality) {
    const img = new Image();
    
    img.onload = () => {
        try {
            // 1. 确保质量参数有效
            const qualityNum = Math.max(0, Math.min(100, parseInt(quality))) / 100;
            
            // 2. 根据图片类型和质量选择最佳压缩策略
            const isJPEG = currentFile.type === 'image/jpeg';
            const isPNG = currentFile.type === 'image/png';
            
            // 3. 为不同类型的图片应用不同的压缩策略
            if (isJPEG) {
                // JPEG图片：调整质量和尺寸
                compressJPEG(img, qualityNum);
            } else if (isPNG) {
                // PNG图片：优先调整尺寸，对于透明图片保留透明度
                compressPNG(img, qualityNum);
            } else {
                // 其他类型：转为JPEG处理
                compressJPEG(img, qualityNum);
            }
        } catch (error) {
            console.error('压缩图片时出错:', error);
            alert('压缩图片时出错，请尝试较小的图片或降低压缩质量。');
        }
    };
    
    img.onerror = () => {
        console.error('加载图片失败');
        alert('加载图片失败，请检查图片格式是否正确。');
    };
    
    img.src = src;
}

// 压缩JPEG图片
function compressJPEG(img, quality) {
    // 计算压缩后的尺寸
    let { width, height } = calculateDimensions(img.width, img.height);
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 使用双线性插值算法进行缩放
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 绘制图片
    ctx.fillStyle = '#FFFFFF'; // 设置白色背景
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // 对于大图片和低质量设置，额外优化
    let outputType = 'image/jpeg';
    let outputQuality = quality;
    
    // 针对文件大小进行优化调整
    if (currentFile.size > 2 * 1024 * 1024) { // 大于2MB的图片
        outputQuality = Math.min(quality, 0.7); // 最高质量限制为70%
    } else if (currentFile.size > 1 * 1024 * 1024) { // 大于1MB的图片
        outputQuality = Math.min(quality, 0.8); // 最高质量限制为80%
    }
    
    // 使用toBlob创建压缩后的图片
    canvas.toBlob(handleCompressedBlob, outputType, outputQuality);
}

// 压缩PNG图片
function compressPNG(img, quality) {
    // 计算压缩后的尺寸
    let { width, height } = calculateDimensions(img.width, img.height);
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 使用双线性插值算法进行缩放
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 保留透明度
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // 根据文件大小和质量选择适当的输出格式
    let outputType = 'image/png';
    let outputQuality = 1.0; // PNG通常不使用质量参数，但我们设置最高质量
    
    // 如果质量低于50%，考虑转换为JPEG以获得更好的压缩率
    if (quality < 0.5 && !hasTransparency(ctx, width, height)) {
        outputType = 'image/jpeg';
        outputQuality = quality;
        
        // 重新绘制带白色背景的图像
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
    } else {
        // 使用优化的PNG设置
        if (currentFile.size > 1 * 1024 * 1024) {
            // 降低大图片的尺寸更多
            const scaleFactor = Math.min(1, 1 * 1024 * 1024 / currentFile.size);
            width = Math.round(width * scaleFactor);
            height = Math.round(height * scaleFactor);
            
            // 重新绘制以适应新尺寸
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
        }
    }
    
    // 使用toBlob创建压缩后的图片
    canvas.toBlob(handleCompressedBlob, outputType, outputQuality);
}

// 检查图像是否有透明部分
function hasTransparency(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] < 255) {
            return true;
        }
    }
    return false;
}

// 处理压缩后的Blob对象
function handleCompressedBlob(blob) {
    if (!blob) {
        console.error('无法创建Blob对象');
        return;
    }
    
    // 检查是否成功压缩（是否比原图小）
    if (blob.size >= currentFile.size) {
        // 如果压缩后比原图大，则尝试更激进的压缩方法
        console.warn('压缩后图片比原图大，尝试更激进的压缩...');
        tryAggressiveCompression();
        return;
    }
    
    // 使用 URL.createObjectURL 创建可显示的URL
    const compressedUrl = URL.createObjectURL(blob);
    compressedImage.src = compressedUrl;
    
    // 计算压缩后的文件大小
    const compressedSizeValue = blob.size;
    document.getElementById('compressedSize').textContent = formatFileSize(compressedSizeValue);
    
    // 显示压缩比例
    const originalSizeValue = currentFile.size;
    const compressionRatio = ((originalSizeValue - compressedSizeValue) / originalSizeValue * 100).toFixed(1);
    
    // 确保压缩率显示为正数
    const displayRatio = Math.max(0, compressionRatio); // 确保显示为正数
    
    const compressionInfo = document.getElementById('compressionInfo');
    if (compressionInfo) {
        compressionInfo.textContent = `压缩率: ${displayRatio}%`;
        // 设置样式以突出显示压缩效果
        if (displayRatio > 50) {
            compressionInfo.style.color = '#009900'; // 良好压缩效果显示为绿色
        } else if (displayRatio > 20) {
            compressionInfo.style.color = '#0066CC'; // 一般压缩效果显示为蓝色
        } else {
            compressionInfo.style.color = '#666666'; // 较低压缩效果显示为灰色
        }
    } else {
        // 如果不存在，创建一个显示压缩比例的元素
        const infoElement = document.createElement('p');
        infoElement.id = 'compressionInfo';
        infoElement.textContent = `压缩率: ${displayRatio}%`;
        if (displayRatio > 50) {
            infoElement.style.color = '#009900';
        } else if (displayRatio > 20) {
            infoElement.style.color = '#0066CC';
        } else {
            infoElement.style.color = '#666666';
        }
        document.querySelector('.compression-settings').appendChild(infoElement);
    }
    
    // 保存压缩后的blob用于下载
    window.compressedBlob = blob;
}

// 尝试更激进的压缩方法
function tryAggressiveCompression() {
    const img = new Image();
    img.onload = () => {
        // 计算更小的尺寸
        const originalWidth = img.width;
        const originalHeight = img.height;
        const maxDimension = Math.max(originalWidth, originalHeight);
        
        // 根据图片大小设置压缩参数
        let targetSize;
        if (currentFile.size > 5 * 1024 * 1024) { // 大于5MB
            targetSize = Math.min(1200, maxDimension); // 最大1200px
        } else if (currentFile.size > 2 * 1024 * 1024) { // 大于2MB
            targetSize = Math.min(1500, maxDimension); // 最大1500px
        } else {
            targetSize = Math.min(1800, maxDimension); // 最大1800px
        }
        
        const ratio = originalWidth / originalHeight;
        let width, height;
        
        if (originalWidth > originalHeight) {
            width = targetSize;
            height = Math.round(targetSize / ratio);
        } else {
            height = targetSize;
            width = Math.round(targetSize * ratio);
        }
        
        // 创建Canvas进行绘制
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // 强制转换为JPEG格式，使用低质量
        canvas.toBlob((blob) => {
            if (!blob || blob.size >= currentFile.size) {
                // 如果仍然无法压缩，显示警告
                displayCompressionWarning();
                // 但仍然显示处理后的图片
                if (blob) {
                    const compressedUrl = URL.createObjectURL(blob);
                    compressedImage.src = compressedUrl;
                    document.getElementById('compressedSize').textContent = formatFileSize(blob.size);
                    window.compressedBlob = blob;
                }
            } else {
                // 处理成功压缩的情况
                handleCompressedBlob(blob);
            }
        }, 'image/jpeg', 0.5); // 使用较低的质量
    };
    
    img.onerror = () => {
        console.error('加载图片失败');
        displayCompressionWarning();
    };
    
    img.src = originalImageData;
}

// 显示压缩警告
function displayCompressionWarning() {
    const compressionInfo = document.getElementById('compressionInfo');
    if (compressionInfo) {
        compressionInfo.textContent = '无法有效压缩此图片';
        compressionInfo.style.color = '#CC0000';
    } else {
        const infoElement = document.createElement('p');
        infoElement.id = 'compressionInfo';
        infoElement.textContent = '无法有效压缩此图片';
        infoElement.style.color = '#CC0000';
        document.querySelector('.compression-settings').appendChild(infoElement);
    }
}

// 计算压缩后的尺寸
function calculateDimensions(width, height) {
    const MAX_WIDTH = 2048;
    const MAX_HEIGHT = 2048;
    
    let ratio = width / height;
    let newWidth = width;
    let newHeight = height;
    
    // 如果图片尺寸超过最大限制，按比例缩小
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width > height) {
            newWidth = MAX_WIDTH;
            newHeight = Math.round(MAX_WIDTH / ratio);
        } else {
            newHeight = MAX_HEIGHT;
            newWidth = Math.round(MAX_HEIGHT * ratio);
        }
    }
    
    // 对于大图片，根据文件大小调整尺寸
    if (currentFile && currentFile.size > 1024 * 1024) {
        // 根据文件大小计算缩放因子
        let sizeFactor = 1;
        
        if (currentFile.size > 5 * 1024 * 1024) { // 大于5MB
            sizeFactor = 0.5;
        } else if (currentFile.size > 3 * 1024 * 1024) { // 大于3MB
            sizeFactor = 0.6;
        } else if (currentFile.size > 2 * 1024 * 1024) { // 大于2MB
            sizeFactor = 0.7;
        } else if (currentFile.size > 1 * 1024 * 1024) { // 大于1MB
            sizeFactor = 0.8;
        }
        
        newWidth = Math.round(newWidth * sizeFactor);
        newHeight = Math.round(newHeight * sizeFactor);
    }
    
    return { width: newWidth, height: newHeight };
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
    
    if (currentFile && originalImageData) {
        // 防抖处理，避免频繁操作导致卡顿
        if (window.compressionTimeout) {
            clearTimeout(window.compressionTimeout);
        }
        
        window.compressionTimeout = setTimeout(() => {
            compressImage(originalImageData, quality);
        }, 100); // 100毫秒的延迟，提供更平滑的体验
    }
});

// 下载压缩后的图片
downloadButton.addEventListener('click', () => {
    if (!window.compressedBlob) {
        alert('请先压缩图片！');
        return;
    }
    
    // 检查是否压缩成功（小于原图）
    if (window.compressedBlob.size >= currentFile.size) {
        if (confirm('压缩后的图片大小没有减小。是否仍要下载？')) {
            downloadCompressedImage();
        }
    } else {
        downloadCompressedImage();
    }
});

// 下载压缩后的图片
function downloadCompressedImage() {
    try {
        // 使用 URL.createObjectURL 和 blob 对象直接下载
        const url = URL.createObjectURL(window.compressedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed_${currentFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理 URL 对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error('下载图片时出错:', error);
        alert('下载图片时出错，请重试。');
    }
} 