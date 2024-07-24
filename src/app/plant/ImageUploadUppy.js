import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useLocalStorage } from "@/utilities/useLocalStorage";
import { useAppContext } from "@/context/appContext";
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { Dashboard } from '@uppy/react';
import ImageEditor from '@uppy/image-editor';
import Webcam from "@uppy/webcam";
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import '@uppy/core/dist/style.css';
import '@uppy/webcam/dist/style.css'

export default function UppyUploadWidget({ treeIndex }) {
  const [images, setImages] = useLocalStorage("images", []);
  const [uppy, setUppy] = useState();
  const [attachments, setAttachments] = useState({})
  const { currentTrees, setCurrentTrees} = useAppContext()
  const [, forceUpdate] = useReducer(x => x + 1, 0);


  useEffect(() => {
    forceUpdate()
    setAttachments({})
  }, [treeIndex])

  useEffect(() => {
    console.log(images)
  }, [images])

  const setTreeImages = (index, images) => {
    const newTrees = [...currentTrees]
    newTrees[index].images = images
    setCurrentTrees(newTrees)
  }

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const uppy = new Uppy({
      meta: { 
        type: 'avatar',
        treeIndex
      },
      restrictions: {
        maxFileSize: 5000000,
        maxNumberOfFiles: 3,
        allowedFileTypes: ['image/*'],
        requiredMetaFields: [],
      },
      autoProceed: true,
    })
    .use(ImageEditor, {
        id: 'ImageEditor',
        quality: 0.8,
        cropperOptions: {
            viewMode: 1,
            background: false,
            autoCropArea: 1,
            responsive: true,
            croppedCanvasOptions: {},
        }
    })
    .use(Webcam, {
      onBeforeSnapshot: () => Promise.resolve(),
      countdown: false,
      modes: [
        'picture',
      ],
      mirror: true,
      videoConstraints: {
        facingMode: 'environment',
        width: { min: 720, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 800, max: 1080 },
      },
      showRecordingLength: false,
      locale: {},
    })
    .use(Tus, {endpoint: 'https://tusd.tusdemo.net/files/',
        method: 'post',
    });

    if(currentTrees[treeIndex].images?.length) {
      const currentTreeIndex = treeIndex
      currentTrees[treeIndex].images.forEach((image, index) => {
        fetch(image, { signal })
        .then((response) => response.blob())
        .then((blob) => {
          if(treeIndex === currentTreeIndex) {
            uppy.addFile({
              name: "image_"+ index + ".jpg",
              type: blob.type,
              data: blob,
              meta: {
                treeIndex: currentTreeIndex
              }
            });
          }
        });
      })
    }

    setUppy(uppy);

    return () => {
      controller.abort()
    }
  }, [treeIndex])

  // React.useEffect(() => {
  //   return () => uppy.close({ reason: 'unmount' })
  // }, [uppy])

  if (!uppy) {
    return ("loading...");
  }
  uppy.on('upload-success', (file, response) => {
    attachments[response.uploadURL] = true
    setAttachments(attachments)
    setTreeImages(file.meta.treeIndex, Object.keys(attachments))
  });

  return (
      <Dashboard
        id="ImageUploader"
        plugins={["Webcam", "ImageEditor", "FileInput"]}
        uppy={uppy}
        width={'100%'}
        doneButtonHandler={() => {
          uppy.cancelAll()
          setAttachments({})
          setTreeImages(treeIndex, null)
        }}
        proudlyDisplayPoweredByUppy={false}
      />
  )
}