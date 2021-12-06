// const video_tl = document.getElementById('#video-tl');


// $(document).ready(async ()=>{
//   let video_tl = document.querySelector('video#video-tl');
//   let video_tr = document.querySelector('video#video-tr');
//   let video_bl = document.querySelector('video#video-bl');
//   let videoElems = [video_tl, video_tr, video_bl];
//   let devices= await navigator.mediaDevices.enumerateDevices();
//   let videoIndex = 0;
//   await new Promise(async (resolve, reject) => {
//     try {
//       if (devices.length === 0) return resolve();
//       let funSync = async () => {
//         console.log(devices[videoIndex].kind);
//         if (devices[videoIndex].kind === "videoinput") {
//           let newStream = await navigator.mediaDevices.getUserMedia({
//             audio: true,
//             video: {
//               width: { ideal: videoElems[videoIndex].clientWidth },
//               height: { ideal: videoElems[videoIndex].clientHeight }
//             }
//           });
//           videoElems[videoIndex].srcObject = newStream;
//           console.log(videoIndex + ": " + newStream)
//           videoElems[videoIndex].play()
//           videoIndex++;
//         }
//         videoIndex++;
//         if (videoIndex == devices.length) return resolve();
//         else funSync();
//       }
//       funSync();
//     } catch (e) {
//       reject(e);
//     }
//   });
// });