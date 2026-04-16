function loadFonts() {
    const fonts = [
        new FontFace('SukhumvitSetThin', 'url(assets/fonts/SukhumvitSet-Thin.woff)'),
        new FontFace('SukhumvitSetText', 'url(assets/fonts/SukhumvitSet-Text.woff)'),
        new FontFace('SukhumvitSetLight', 'url(assets/fonts/SukhumvitSet-Light.woff)'),
        new FontFace('SukhumvitSetMedium', 'url(assets/fonts/SukhumvitSet-Medium.woff)'),
        new FontFace('SukhumvitSetSemiBold', 'url(assets/fonts/SukhumvitSet-SemiBold.woff)'),
        new FontFace('SukhumvitSetBold', 'url(assets/fonts/SukhumvitSet-Bold.woff)'),
        new FontFace('SukhumvitSetExtraBold', 'url(assets/fonts/SukhumvitSet-Extra%20Bold.woff)'),
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
    ];

    return Promise.all(fonts.map(font => font.load())).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
    document.addEventListener('paste', handlePaste);
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    
    const formattedDateTime = localDateTime.substring(0, 16);
    document.getElementById('datetime').value = formattedDateTime;
    
    const oneMinuteLater = new Date(now.getTime() + 60000);
    const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
    const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
    const formattedTimePlusOne = `${hours}:${minutes}`;
    document.getElementById('datetime_plus_one').value = formattedTimePlusOne;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDateWithDay(date) {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = months[d.getMonth()];

    return `${dayName}ที่ ${day} ${month}`;
}

function formatDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const day = padZero(d.getDate());
    const month = padZero(d.getMonth() + 1);
    const year = (d.getFullYear() + 543).toString().substr(-2);
    return `${day}/${month}/${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

function handlePaste(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

window.updateDisplay = async function() {
    const backgroundSelect = document.getElementById('backgroundSelect')?.value || 'assets/image/bs/backgroundEnter-KB2.1.jpg';
    const datetime = document.getElementById('datetime')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const money02 = document.getElementById('money02')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';

    let datePart = new Date().toISOString().substring(0, 10);
    let timePart = '-';
    if (datetime !== '-') {
        datePart = datetime.substring(0, 10);
        timePart = datetime.substring(11, 16);
    }

    const formattedDate = formatDate(datePart); 
    const formattedDateWithDay = formatDateWithDay(datePart); 
    const formattedTime = timePart; 
    const formattedTimePlusOne = datetimePlusOne; 

    let timeMessage = "ตอนนี้";
    if (formattedTime !== '-' && formattedTimePlusOne !== '-') {
        let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00`) - new Date(`1970-01-01T${formattedTime}:00`)) / 60000);
        if (timeDifference > 1) {
            timeMessage = `${timeDifference} นาทีที่แล้ว`;
        } else if (timeDifference === 1) {
            timeMessage = "1 นาทีที่แล้ว";
        }
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loadImage = (src) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });

    const bgImg = await loadImage(backgroundSelect);
    
    if (bgImg) {
        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        canvas.width = 591;
        canvas.height = 1280;
        ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawText(ctx, `${formattedTimePlusOne} น.`, 110,33,20, 'SFThonburiRegular', '#e5efee','right', 1.5, 3, 0, 0, 800, -0.25);
    drawText(ctx, `บัญชีของฉัน`, 39,195,30, 'SukhumvitSetMedium', '#e5efee','left', 1.5, 3, 0, 0, 800,);
    drawText(ctx, `${senderaccount1}`, 39,235,24, 'SukhumvitSetMedium', '#e5efee','left', 1.5, 3, 0, 0, 800, 0.25);
    drawText(ctx, `ข้อมูล ณ เวลา ${formattedTime} น.`, 221, 609,19.30, 'SukhumvitSetMedium', '#c2cacd','left', 1.5, 3, 0, 0, 800, 0.25);
    drawText(ctx, `${money02}`, 295.5, 440,42, 'SukhumvitSetMedium', '#ffffff', 'center', 40, 3, 0, 0, 430,-0.25);

    if (qrCodeImage) {
        ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951);
    }
    drawBattery(ctx, batteryLevel, powerSavingMode);
};

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }

        lines.forEach((line, index) => {
            let currentX = x;

            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });

        currentY + lineHeight;
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char, index) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

function drawBattery(ctx, batteryLevel, powerSavingMode) {
    ctx.lineWidth = 2; 
    ctx.strokeStyle = '#9b9b9b'; 
    ctx.fillStyle = '#ffffff'; 

    let batteryColor = '#28bf2b'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillWidth = (batteryLevel / 100) * 26; 
    const x = 523;
    const y = 20.0;
    const height = 12.8;
    const radius = 3; 

    ctx.fillStyle = batteryColor; 

    ctx.beginPath(); 
    ctx.moveTo(x, y + radius); 
    ctx.lineTo(x, y + height - radius); 
    ctx.arcTo(x, y + height, x + radius, y + height, radius); 
    ctx.lineTo(x + fillWidth - radius, y + height); 
    ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); 
    ctx.lineTo(x + fillWidth, y + radius); 
    ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); 
    ctx.lineTo(x + radius, y); 
    ctx.arcTo(x, y, x, y + radius, radius); 
    ctx.closePath(); 
    ctx.fill(); 

    drawText(ctx, `${batteryLevel}`, x + 26 / 2, y + height / 1.21, 13, 'SFThonburiSemiBold', '#ffffff', 'center', 1, 1, 0, 0, 100, -1);
}

window.togglePowerSavingMode = function() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if(powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    if(typeof updateDisplay === 'function') updateDisplay();
}

window.updateBatteryUI = function() {
    const batteryLevel = document.getElementById('battery').value;
    const levelText = document.getElementById('battery-level');
    if(levelText) levelText.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'deposit_kbank_3.png';
    link.click();
}

const generateBtn = document.getElementById('generate');
if(generateBtn) generateBtn.addEventListener('click', updateDisplay);

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}
