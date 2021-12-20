//////// 変数 ////////
// 要素を取得
const camera_select = document.getElementsByClassName("camera-select");
const mic = document.getElementById("mic");
const btn_recording_start = document.getElementById("btn-recording-start");
const btn_recording_stop = document.getElementById("btn-recording-stop");
const canvas = document.getElementById("cameras");
const canvasCtx = canvas.getContext('2d');

// const videoBitRate = document.getElementById("videoBitRate");
// const audioBitRate = document.getElementById("audioBitRate");
const time_recording = document.getElementById("time-recording");
const status_recording = document.getElementById("status-recording");

const font = '900 48pt sans-serif';
const fontAwesome = '900 64pt "Font Awesome 5 Free"';

// 定義
let canvasWidth = 1280;
let canvasHeight = 720;
let video_tl, video_tr, video_bl, video_br;
let mediaRecorder;
let audioId = '';
let isRecording = false;

// 動画をcanvasに表示させるFPS（計算合ってるかあやしい）
const fps = 30;
let timer_video_tl, timer_video_tr, timer_video_bl, timer_video_br;
let time_recording_sec = 0;
let timer_recording;

window.addEventListener('load', (event) => {
    //////// イニシャライズ ////////
    canvas.width = 1280;
    canvas.height = 720;
    video_tl = document.createElement('video');
    video_tl.class = 'video-tl';
    video_tr = document.createElement('video');
    video_tr.class = 'video-tr';
    video_bl = document.createElement('video');
    video_bl.class = 'video-bl';
    video_br = document.createElement('video');
    video_br.class = 'video-br';

    //////// デバイスが選択されたら ////////
    Array.from(camera_select).map((cs, index) => {
        cs.onchange = event => {
            if (cs.value === 'none') stopVideo(index);
            else {
                // console.log(cs.value);
                navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        width: 640,
                        height: 360,
                        deviceId: cs.value,
                    }
                }).then(stream => {
                    playVideo(index, stream);
                }).catch(function(e) {
                    alert("ERROR: Webカメラの起動に失敗しました: " + e.message);
                });
            }
        }
    });
    mic.onchange = event => {
        if (mic.value === 'none') audioId = '';
        else audioId = mic.value;
    }

    // setInterval(() => {
    //     if (isRecording) {
    //         mediaRecorder.addEventListener('dataavailable', (event) => {
    //             console.log(event.data);
    //         });
    //     }
    // }, 1000);
});

//////// 録画 ////////
function clickBtnRecordingStart() {
    if (!confirm('録画を開始します')) return;
    const videoStream = canvas.captureStream();
    navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: audioId }
    }).then(stream => {
        const combinedStream = new MediaStream([videoStream.getTracks()[0], stream.getAudioTracks()[0]]);
        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
        if (mediaRecorder.state == "recording") return;
        btn_recording_start.style.display = 'none';
        btn_recording_stop.style.display = 'inline-block';
        timer_recording = setInterval(() => {
            status_recording.innerHTML = mediaRecorder.state;
            time_recording.innerHTML = transSecToTime(time_recording_sec);
            time_recording_sec++;
        }, 1000);
        Array.from(camera_select).map((cs, index) => {
            cs.disabled = true;
        });
        mic.disabled = true;
        mediaRecorder.start();
        status_recording.innerHTML = mediaRecorder.state;
        isRecording = true;
    });
}
function clickBtnRecordingStop() {
    if (mediaRecorder.state == "inactive") return;
    btn_recording_start.style.display = 'inline-block';
    btn_recording_stop.style.display = 'none';
    Array.from(camera_select).map((cs, index) => {
        cs.disabled = false;
    });
    mic.disabled = false;
    mediaRecorder.stop();
    isRecording = false;

    //////// ダウンロード表示 ////////
    mediaRecorder.addEventListener('dataavailable', (event) => {
        // console.log(event.data);
        // if (event.data && event.data.size > 0) {
        // ダウンロード用のリンクを準備
        const anchor = document.createElement('a');
        const videoBlob = new Blob([event.data], { type: event.data.type });
        blobUrl = window.URL.createObjectURL(videoBlob);
        anchor.download = getNow() + '.webm';
        anchor.href = blobUrl;
        anchor.click();
        clearInterval(timer_recording);
        status_recording.innerHTML = mediaRecorder.state;
        time_recording.innerHTML = '00:00:00';
        time_recording_sec = 0;
        // }
    });
}

function playVideo(videoIndex, stream) {
    switch (videoIndex) {
        case 0:
            video_tl.srcObject = stream;
            video_tl.onloadedmetadata = event => {
                video_tl.play();
                timer_video_tl = setInterval(() => {
                    if (canvas && canvasCtx) canvasCtx.drawImage(video_tl, 0, 0, 640, 360);
                }, 1000/fps);
            };
            break;
        case 1:
            video_tr.srcObject = stream;
            video_tr.onloadedmetadata = event => {
                video_tr.play();
                timer_video_tr = setInterval(() => {
                    if (canvas && canvasCtx) canvasCtx.drawImage(video_tr, 640, 0, 640, 360);
                }, 1000/fps);
            };
            break;
        case 2:
            video_bl.srcObject = stream;
            video_bl.onloadedmetadata = event => {
                video_bl.play();
                timer_video_bl = setInterval(() => {
                    if (canvas && canvasCtx) canvasCtx.drawImage(video_bl, 0, 360, 640, 360);
                }, 1000/fps);
            };
            break;
        case 3:
            video_br.srcObject = stream;
            video_br.onloadedmetadata = event => {
                video_br.play();
                timer_video_br = setInterval(() => {
                    if (canvas && canvasCtx) canvasCtx.drawImage(video_br, 640, 360, 640, 360);
                }, 1000/fps);
            };
            break;
        default:
            console.log(`Sorry, we are out of ${videoIndex}.`);
    }
}
function stopVideo(videoIndex) {
    switch (videoIndex) {
        case 0:
            video_tl.pause();
            video_tl.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            clearInterval(timer_video_tl);
            video_tl.srcObject = null;
            canvasCtx.clearRect(0, 0, canvasWidth / 2, canvasHeight / 2);
            drawIconToCanvas('\uF4E2', canvasWidth / 4, canvasHeight / 4);
            break;
        case 1:
            video_tr.pause();
            video_tr.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            clearInterval(timer_video_tr);
            video_tr.srcObject = null;
            canvasCtx.clearRect(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight / 2);
            drawIconToCanvas('\uF4E2', (canvasWidth / 4) * 3, canvasHeight / 4);
            break;
        case 2:
            video_bl.pause();
            video_bl.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            clearInterval(timer_video_bl);
            video_bl.srcObject = null;
            canvasCtx.clearRect(0, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
            drawIconToCanvas('\uF4E2', canvasWidth / 4, (canvasHeight / 4) * 3);
            break;
        case 3:
            video_br.pause();
            video_br.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            clearInterval(timer_video_br);
            video_br.srcObject = null;
            canvasCtx.clearRect(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
            drawIconToCanvas('\uF4E2', (canvasWidth / 4) * 3, (canvasHeight / 4) * 3);
            break;
        default:
            console.log(`Sorry, we are out of ${videoIndex}.`);
    }
    drawLineToCanvas(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
    drawLineToCanvas(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
}

function drawLineToCanvas(beginPosX, beginPosY, endPosX, endPosY) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(beginPosX, beginPosY);
    canvasCtx.lineTo(endPosX, endPosY);
    canvasCtx.strokeStyle = "gray";
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();
}
function drawTextToCanvas(str, posX, posY) {
    document.fonts.load(font).then((_) => {
        canvasCtx.font = font;
        canvasCtx.textBaseline = "middle";
        canvasCtx.fillStyle = "white";
        canvasCtx.strokeText(str, posX - 24, posY);
    });
}
function drawIconToCanvas(str, posX, posY) {
    document.fonts.load(fontAwesome).then((_) => {
        canvasCtx.font = fontAwesome;
        canvasCtx.textBaseline = "middle";
        canvasCtx.fillStyle = "gray";
        canvasCtx.fillText(str, posX - 48, posY);
    });
}

function getNow() {
    const now = new Date();
    const y = now.getFullYear();
    const m = ('00' + now.getMonth()).slice(-2);
    const d = ('00' + now.getDate()).slice(-2);
    const h = ('00' + now.getHours()).slice(-2);
    const min = ('00' + now.getMinutes()).slice(-2);
    const s = ('00' + now.getSeconds()).slice(-2);
    return y + m + d + '_' + h + min + s;
}
function transSecToTime(sec) {
    const h = ('00' + parseInt(sec / 3600)).slice(-2);
    const m = ('00' + parseInt(sec / 60)).slice(-2);
    const s = ('00' + (sec - ((h * 3600) + (m * 60)))).slice(-2);
    return h + ':' + m + ':' + s;
}